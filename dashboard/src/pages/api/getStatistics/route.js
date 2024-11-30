import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Fetch total recharge amount
      const { data: totalRechargeData, error: totalRechargeError } = await supabase
        .from('investments')
        .select('amount', { count: 'exact' });
      if (totalRechargeError) throw totalRechargeError;
      const totalRecharge = totalRechargeData.reduce((sum, record) => sum + record.amount, 0);

      // Fetch returned amount
      const { data: returnedData, error: returnedError } = await supabase
        .from('investments')
        .select('amount')
        .eq('status', 'returned');
      if (returnedError) throw returnedError;
      const returnedAmount = returnedData.reduce((sum, record) => sum + record.amount, 0);

      // Fetch locked orders count and amount
      const { data: lockedData, error: lockedError } = await supabase
        .from('investments')
        .select('amount')
        .eq('status', 'locked');
      if (lockedError) throw lockedError;
      const lockedOrdersCount = lockedData.length;
      const lockedOrdersAmount = lockedData.reduce((sum, record) => sum + record.amount, 0);

      // Fetch today's recharge amount
      const { data: dailyRechargeData, error: dailyRechargeError } = await supabase
        .from('investments')
        .select('amount')
        .gte('start_time', today.toISOString());
      if (dailyRechargeError) throw dailyRechargeError;
      const dailyRecharge = dailyRechargeData.reduce((sum, record) => sum + record.amount, 0);

      // Fetch today's unlock amount
      const { data: dailyUnlockData, error: dailyUnlockError } = await supabase
        .from('investments')
        .select('amount')
        .eq('status', 'unlocked')
        .gte('unlocked_at', today.toISOString())
        .lt('unlocked_at', tomorrow.toISOString());
      if (dailyUnlockError) throw dailyUnlockError;
      const dailyUnlock = dailyUnlockData.reduce((sum, record) => sum + record.amount, 0);

      // Fetch tomorrow's unlock amount
      const { data: tomorrowUnlockData, error: tomorrowUnlockError } = await supabase
        .from('investments')
        .select('amount')
        .gte('unlocked_at', tomorrow.toISOString())
        .lt('unlocked_at', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString());
      if (tomorrowUnlockError) throw tomorrowUnlockError;
      const tomorrowUnlock = tomorrowUnlockData.reduce((sum, record) => sum + record.amount, 0);

      // Fetch daily recharge history for chart (last 7 days)
      const dailyRechargeHistory = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        const { data: dayData, error: dayError } = await supabase
          .from('investments')
          .select('amount')
          .gte('start_time', date.toISOString())
          .lt('start_time', nextDate.toISOString());
        if (dayError) throw dayError;
        const dayTotal = dayData.reduce((sum, record) => sum + record.amount, 0);
        dailyRechargeHistory.push({ date: date.toISOString().split('T')[0], amount: dayTotal });
      }

      res.status(200).json({
        totalRecharge,
        returnedAmount,
        lockedOrdersCount,
        lockedOrdersAmount,
        dailyRecharge,
        dailyUnlock,
        tomorrowUnlock,
        dailyRechargeHistory,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
