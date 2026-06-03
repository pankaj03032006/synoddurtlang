import React, {
  createContext,
  useState,
  useEffect,
  useCallback
} from "react";

const UserContext = createContext({});

const UserContextProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState(null);

  const [token, setToken] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load user from localStorage

  useEffect(() => {

    try {

      const storedToken = localStorage.getItem("token");

      const storedUser = localStorage.getItem("currentUser");

      if (storedToken && storedUser) {

        const parsedUser = JSON.parse(storedUser);

        setToken(storedToken);

        setCurrentUser(parsedUser);

        setIsLoggedIn(true);

      } else {

        setToken(null);

        setCurrentUser(null);

        setIsLoggedIn(false);

      }

    } catch (error) {

      console.error("Initialization error:", error);

      setToken(null);

      setCurrentUser(null);

      setIsLoggedIn(false);

    } finally {

      setLoading(false);

    }

  }, []);

  // LOGIN

  const signInUser = useCallback((userData, authToken) => {

    try {

      localStorage.setItem("token", authToken);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(userData)
      );

      setToken(authToken);

      setCurrentUser(userData);

      setIsLoggedIn(true);

      return true;

    } catch (error) {

      console.error("Sign in error:", error);

      return false;

    }

  }, []);

  // LOGOUT

  const signOutUser = useCallback(() => {

    localStorage.removeItem("token");

    localStorage.removeItem("currentUser");

    setToken(null);

    setCurrentUser(null);

    setIsLoggedIn(false);

  }, []);

  return (

    <UserContext.Provider
      value={{
        currentUser,
        token,
        isLoggedIn,
        loading,
        signInUser,
        signOutUser,
        setCurrentUser
      }}
    >

      {children}

    </UserContext.Provider>

  );

};

export { UserContext, UserContextProvider };