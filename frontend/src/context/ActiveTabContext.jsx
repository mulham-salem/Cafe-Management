import React, { createContext, useState, useContext } from "react";

const allowedTabs = ["inventory", "supply", "offers", "purchaseBills", "supplyHistory", null];

const ActiveTabContext = createContext();

export function ActiveTabProvider({ children }) {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("activeTab");

    const parsed = saved === "null" ? null : saved;
    return allowedTabs.includes(parsed) ? parsed : null;
  });

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab === null ? "null" : tab);
  };

  return (
    <ActiveTabContext.Provider value={{ activeTab, changeTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}

export function useActiveTab() {
  return useContext(ActiveTabContext);
}
