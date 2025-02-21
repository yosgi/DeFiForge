import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const {
        page = 1,
        pageSize = 10,
        account,
        balanceMin,
        balanceMax,
        level,
        totalInvestmentMin,
        totalInvestmentMax,
        userId,
        savingMin,
        savingMax,
        savingEarningMin,
        savingEarningMax,
        bitPowerMin,
        bitPowerMax
      } = req.query;

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Filters
      if (account) {
        query = query.ilike('account', `%${account}%`);
      }

      if (userId) {
        query = query.eq('id', userId);
      }

      if (balanceMin) {
        query = query.gte('balance', Number(balanceMin));
      }

      if (balanceMax) {
        query = query.lte('balance', Number(balanceMax));
      }

      if (level) {
        query = query.eq('level', level);
      }

      if (totalInvestmentMin) {
        query = query.gte('total_investment', Number(totalInvestmentMin));
      }

      if (totalInvestmentMax) {
        query = query.lte('total_investment', Number(totalInvestmentMax));
      }

      // New filters for saving, saving_earning, and BitPowerMEC
      if (savingMin) {
        query = query.gte('saving', Number(savingMin));
      }

      if (savingMax) {
        query = query.lte('saving', Number(savingMax));
      }

      if (savingEarningMin) {
        query = query.gte('saving_earning', Number(savingEarningMin));
      }

      if (savingEarningMax) {
        query = query.lte('saving_earning', Number(savingEarningMax));
      }

      if (bitPowerMin) {
        query = query.gte('BitPowerMEC', Number(bitPowerMin));
      }

      if (bitPowerMax) {
        query = query.lte('BitPowerMEC', Number(bitPowerMax));
      }

      // Execute query
      const { data: users, error, count } = await query;

      if (error) throw error;

      res.status(200).json({ users, total: count });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
