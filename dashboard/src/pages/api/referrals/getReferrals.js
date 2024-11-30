import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, pageSize = 10, referrer_wallet_address, wallet_address } = req.query;

      let query = supabase
        .from('referrals')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (referrer_wallet_address) {
        query = query.ilike('referrer_wallet_address', `%${referrer_wallet_address}%`);
      }

      if (wallet_address) {
        query = query.ilike('wallet_address', `%${wallet_address}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.status(200).json({ referrals: data, total: count, page, pageSize });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
