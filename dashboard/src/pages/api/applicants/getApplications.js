import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: applications, error: applicationsError } = await supabase
        .from('partner_applications')
        .select('*');

      if (applicationsError) throw applicationsError;

      const enrichedApplications = await Promise.all(applications.map(async (application) => {
        const { data: referral, error: referralError } = await supabase
          .from('referrals')
          .select('referrer_wallet_address')
          .eq('wallet_address', application.wallet_address)
          .single();

        if (referralError) throw referralError;

        return {
          ...application,
          referrer: referral?.referrer_wallet_address || 'N/A',
        };
      }));

      res.status(200).json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
