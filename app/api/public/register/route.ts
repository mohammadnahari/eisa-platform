import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RegisterPayload = {
  full_name?: string
  phone?: string
  email?: string
  selectedPath?: 'executive' | 'personal' | null
  current_situation?: string
  desired_outcome?: string
  biggest_obstacle?: string
  previous_coaching?: string
  commitment_level?: string
}

function clean(value?: string) {
  return value?.trim() ?? ''
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://coach.eisaprod.com').replace(/\/$/, '')
}

function generateTemporaryPassword() {
  return `Temp-${crypto.randomUUID()}-${Date.now()}!`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload

    const fullName = clean(body.full_name)
    const phone = clean(body.phone)
    const email = clean(body.email).toLowerCase()
    const selectedPath = body.selectedPath ?? null
    const currentSituation = clean(body.current_situation)
    const desiredOutcome = clean(body.desired_outcome)

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'full_name_required' }, { status: 400 })
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json({ error: 'phone_required' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'valid_email_required' }, { status: 400 })
    }

    if (!currentSituation || !desiredOutcome) {
      return NextResponse.json({ error: 'discovery_answers_required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const redirectTo = `${getAppUrl()}/reset-password`

    const existingProfile = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile.data?.id) {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo })

      return NextResponse.json({
        ok: true,
        existing: true,
        message: 'account_exists_password_email_sent',
      })
    }

    const createUserResult = await supabase.auth.admin.createUser({
      email,
      password: generateTemporaryPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        source: 'website_registration',
      },
    })

    if (createUserResult.error || !createUserResult.data.user) {
      console.error('Create user failed:', createUserResult.error)
      return NextResponse.json({ error: 'create_user_failed' }, { status: 500 })
    }

    const user = createUserResult.data.user

    const profileResult = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      email,
      phone,
      role: 'client',
      is_active: true,
      preferred_lang: 'ar',
      mfa_enabled: false,
      updated_at: new Date().toISOString(),
    })

    if (profileResult.error) {
      console.error('Create profile failed:', profileResult.error)
      return NextResponse.json({ error: 'create_profile_failed' }, { status: 500 })
    }

    const leadResult = await supabase
      .from('leads')
      .insert({
        full_name: fullName,
        email,
        phone,
        source: 'website',
        discovery_answers: {
          path: selectedPath,
          current_situation: currentSituation,
          desired_outcome: desiredOutcome,
          biggest_obstacle: clean(body.biggest_obstacle),
          previous_coaching: clean(body.previous_coaching),
          commitment_level: clean(body.commitment_level),
        },
        status: 'converted',
        converted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (leadResult.error) {
      console.error('Create lead failed:', leadResult.error)
      return NextResponse.json({ error: 'create_lead_failed' }, { status: 500 })
    }

    const clientResult = await supabase
      .from('clients')
      .insert({
        profile_id: user.id,
        client_type: selectedPath === 'personal' ? 'healing' : 'development',
        client_segment: selectedPath === 'executive' ? 'executive' : 'personal',
        current_stage: 0,
        status: 'paused',
        lead_id: leadResult.data.id,
      })
      .select('id')
      .single()

    if (clientResult.error) {
      console.error('Create client failed:', clientResult.error)
      return NextResponse.json({ error: 'create_client_failed' }, { status: 500 })
    }

    await supabase
      .from('leads')
      .update({
        client_id: clientResult.data.id,
        converted_at: new Date().toISOString(),
      })
      .eq('id', leadResult.data.id)

    const resetResult = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (resetResult.error) {
      console.error('Send password setup email failed:', resetResult.error)

      return NextResponse.json({
        ok: true,
        warning: 'account_created_email_failed',
        user_id: user.id,
        client_id: clientResult.data.id,
      })
    }

    return NextResponse.json({
      ok: true,
      user_id: user.id,
      client_id: clientResult.data.id,
    })
  } catch (error) {
    console.error('Public registration error:', error)
    return NextResponse.json({ error: 'unexpected_error' }, { status: 500 })
  }
}