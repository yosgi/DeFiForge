import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id, leaderId, level, total_team_investment } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' });
    }

    try {
      // Update the team information in the database
      const { data, error } = await supabase
        .from('loop_teams')
        .update({
          leaderId: leaderId,
          level: level,
          total_team_investment: total_team_investment,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({ message: 'Team not found' });
      }

      res.status(200).json({ message: 'Team updated successfully', team: data });
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
