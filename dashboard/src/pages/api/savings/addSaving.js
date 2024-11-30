import supabase from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, amount, type, from } = req.body;
    if (!userId || !amount || amount <= 0) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }
    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, saving")
        .eq("id", userId)
        .single(); 

      if (userError) {
        res.status(500).json({ message: "Error fetching user", error: userError });
        return;
      }

      if (!user) {
        res.status(404).json({ message: `User with ID ${userId} not found` });
        return;
      }

      const newTotalSaving = user.saving + amount;

      const { error: updateError } = await supabase
        .from("users")
        .update({ saving: newTotalSaving })
        .eq("id", userId);
      
      if (updateError) {
        res.status(500).json({ message: "Error updating user's total saving", error: updateError });
        return;
      }

      const { data: newSaving, error: savingError } = await supabase
        .from("savings")
        .insert([{ userId, amount, type, from }]);

      if (savingError) {
        res.status(500).json({ message: "Error adding saving entry", error: savingError });
        return;
      }


      res.status(200).json({
        message: "Saving updated successfully",
        user: { ...user, saving: newTotalSaving },
        savingEntry: newSaving,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
