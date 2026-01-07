import { createClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

// Helper to verify Admin status
async function verifyAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    // Use Admin Client to check role (bypasses RLS to ensure reliability)
    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'ADMIN';
}

export async function GET(req: NextRequest) {
    console.log("ADMIN API: GET called");
    if (!await verifyAdmin()) {
        console.error("ADMIN API: verifyAdmin failed");
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Try with authenticated server client (uses user session + RLS)
        const supabase = createClient();
        console.log("ADMIN API: Fetching with server client...");
        let { data: profiles, error, status } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        // 2. Fallback to admin client if server client returned 0 results or error
        if (error || !profiles || profiles.length === 0) {
            console.log(`ADMIN API: Server client returned 0 or error (${error?.message}). Trying Admin client...`);
            const admin = getSupabaseAdmin();
            const { data: adminProfiles, error: adminError, status: adminStatus } = await admin
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (adminError) {
                console.error("ADMIN API: Admin client also failed:", adminError);
                if (error) throw error;
                throw adminError;
            }

            console.log(`ADMIN API: Admin client returned ${adminProfiles?.length || 0} profiles (status ${adminStatus})`);
            profiles = adminProfiles;
        } else {
            console.log(`ADMIN API: Server client successfully fetched ${profiles?.length} profiles`);
        }

        return NextResponse.json(profiles || []);
    } catch (err: any) {
        console.error("ADMIN API ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!await verifyAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { email, password, full_name, role } = body;
        const admin = getSupabaseAdmin();

        // 1. Create User in Auth
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) throw authError;

        // 2. Create Profile
        const { error: profileError } = await admin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: email,
                full_name: full_name,
                role: role || 'CLIENT',
                created_at: new Date().toISOString()
            });

        if (profileError) throw profileError;

        return NextResponse.json(authData.user);

    } catch (err: any) {
        console.error("ADMIN API ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!await verifyAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        const admin = getSupabaseAdmin();
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
