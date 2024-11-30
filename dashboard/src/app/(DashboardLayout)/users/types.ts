// Define the User interface based on the provided structure
export interface User {
    id: number;
    created_at: string;
    last_accessed_at: string;
    account: string;
    invite_code: string;
    agent_type: string;
    balance: number;
    city: string;
    level_1_count: number;
    level_2_count: number;
    level_3_count: number;
    circulation: number;
    team_total_recharge: number;
    personal_total_recharge: number;
    personal_recharge_count: number;
    total_withdrawal: number;
    notes: string;
    isManager: boolean;
    isWithdrawalProhibited: boolean;
    total_investment: number;
    level: string;
    penalty: boolean;
    teamId: string;
    saving: number;
    saving_earning: number;
    BitPowerMEC: number;
  }
  
  // Define the Record interface for user transaction records
  export interface Record {
    id: string;
    user_address: string;
    amount: number;
    interest: number;
    period: number;
    start_time: string;
    end_time: string;
    orderId: string;
    status: string;
  }
  
  // Define the Team interface, including the team leader and team members
  export interface Team {
    leader: User;
    members: User[];
    total_investment: number;
  }
  
  // Define the Referral interface
  export interface Referral {
    level: number;
    referred_wallet_address: string;
    referrer_wallet_address: string;
  }
  
  // Define the SnackbarType interface for snackbar state
  export interface SnackbarType {
    open: boolean;
    message: string;
    severity: "success" | "error";
  }
  