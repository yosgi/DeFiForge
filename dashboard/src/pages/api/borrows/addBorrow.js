import supabase from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { user_id, amount, lock_period, interest } = req.body;

    if (!user_id || !amount || amount <= 0 || lock_period <= 0 || interest <= 0) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("new_borrow")
        .insert([{ user_id, amount, lock_period, interest, status: "locked" }]);

      if (error) {
        res.status(500).json({ message: "Error adding borrow entry", error });
        return;
      }

      res.status(200).json({ message: "Borrow entry added successfully", data });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
