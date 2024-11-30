import supabase from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { id, amount, lock_period, interest } = req.body;

    if (!id || !amount || amount <= 0 || lock_period <= 0 || interest <= 0) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("new_borrow")
        .update({ amount, lock_period, interest })
        .eq("id", id);

      if (error) {
        res.status(500).json({ message: "Error updating borrow entry", error });
        return;
      }

      res.status(200).json({ message: "Borrow entry updated successfully", data });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
