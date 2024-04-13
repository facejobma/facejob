import React, { createContext, ReactNode, useContext, useState } from "react";


type User = {
  name: string;
  email: string;
  id: string;
  session: string;
  image: string;
} | null;


type SessionContextType = {
  session: {
    user: User;

  };
  setSession: (session: { user: User }) => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

// tmp initial session
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<{
    user: SessionContextType["session"]["user"];
  }>({
    user: {
      name: "Adil ERRADI",
      email: "adil@facejob.ma",
      id: "1",
      session: "test",
      image: "https://www.doyoubuzz.com/var/users/_/2016/3/23/18/1138715/avatar/1069311/avatar_cp_630.jpg?t=1708966037"
    }
  });

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};