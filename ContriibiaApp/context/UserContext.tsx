import React, { createContext, useContext, useState } from 'react';

interface UserData {
  name: string;
  username: string;
  email: string;
  phone: string;
}

interface UserContextType {
  user: UserData;
  setUser: (data: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType>({
  user: { name: '', username: '', email: '', phone: '' },
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData>({
    name: '',
    username: '',
    email: '',
    phone: '',
  });

  const setUser = (data: Partial<UserData>) =>
    setUserState((prev) => ({ ...prev, ...data }));

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
