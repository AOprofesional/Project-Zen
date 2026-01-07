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
    try {
        console.log("ADMIN API: GET called");
        const isAdmin = await verifyAdmin();

        if (!isAdmin) {
            console.error("ADMIN API: verifyAdmin failed (not an admin or not logged in)");
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // 1. Try with authenticated server client
        const supabase = createClient();
        console.log("ADMIN API: Fetching with server client...");

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.log(`ADMIN API: Server client error (${error.message}). Trying Admin client...`);
            const admin = getSupabaseAdmin();
            const { data: adminProfiles, error: adminError } = await admin
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (adminError) {
                console.error("ADMIN API: Admin client also failed:", adminError);
                return NextResponse.json({ error: adminError.message }, { status: 500 });
            }
            return NextResponse.json(adminProfiles || []);
        }

        console.log(`ADMIN API: Successfully fetched ${profiles?.length || 0} profiles`);
        return NextResponse.json(profiles || []);

    } catch (err: any) {
        console.error("ADMIN API FATAL ERROR:", err);
        return NextResponse.json(
            { error: err.message || 'Error interno del servidor' },
            { status: 500 }
        );
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
