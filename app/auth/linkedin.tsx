import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface UserData {
  // Define your user data structure here
}

interface LinkedinCallbackProps {
  data: any; // Adjust the type accordingly based on your API response
}

function LinkedinCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(router.asPath.split('?', 2)[1]);
  
    console.log("router.query.code:", queryParams);
  
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/linkedin/callback?${queryParams}`, {
      headers: new Headers({ accept: "application/json" }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("User data:", responseData);
        setLoading(false);
        setData(responseData);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);
  

  function fetchUserData() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + data?.access_token,
      },
    })
      .then((response) => response.json())
      .then((userData: UserData) => {
        setUser(userData);
      });
  }

  if (loading) {
    return <DisplayLoading />;
  } else {
    if (user != null) {
      return <DisplayData data={user} />;
    } else {
      return (
        <div>
          <DisplayData data={data} />
          <div style={{ marginTop: 10 }}>
            <button onClick={fetchUserData}>Fetch User</button>
          </div>
        </div>
      );
    }
  }
}

function DisplayLoading() {
  return <div>Loading....</div>;
}

function DisplayData({ data }: LinkedinCallbackProps) {
  return (
    <div>
      <samp>{JSON.stringify(data, null, 2)}</samp>
    </div>
  );
}

export default LinkedinCallback;
