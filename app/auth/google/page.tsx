"use client"
import {useState, useEffect} from "react";


interface UserData {
}

interface GoogleCallbackProps {
    data: any;
}

function GoogleCallback() {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({});
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');


        fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback?code=${code}`,
            {
                headers: new Headers({accept: "application/json"}),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    // router.push("/auth/login")
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
        return <DisplayLoading/>;
    } else {
        if (user != null) {
            return <DisplayData data={user}/>;
        } else {
            return (
                <div>
                    <DisplayData data={data}/>
                    <div style={{marginTop: 10}}>
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

function DisplayData({data}: GoogleCallbackProps) {
    return (
        <div>
            <samp>{JSON.stringify(data, null, 2)}</samp>
        </div>
    );
}

export default GoogleCallback;
