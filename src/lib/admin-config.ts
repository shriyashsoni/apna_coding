export const SUPER_ADMINS = {
  wallets: [
    "0x9D307F0C1B614C9088Aa83eAE9AA3D9779c4921D", // Original Admin
    "0x31541C01Bb04A76647fc40B8288E6FD7Df919aAE"  // New Admin (Shriyash Soni)
  ],
  emails: [
    "shriyashsoni@gmail.com",
    "sonishriyash@gmail.com"
  ]
};

export const isSuperAdmin = (address?: string, email?: string) => {
  if (!address && !email) return false;
  
  const isWalletAdmin = address && SUPER_ADMINS.wallets.some(
    w => w.toLowerCase() === address.toLowerCase()
  );
  
  const isEmailAdmin = email && SUPER_ADMINS.emails.some(
    e => e.toLowerCase() === email.toLowerCase()
  );
  
  return isWalletAdmin || isEmailAdmin;
};
