import LoginForm from "../../components/auth/login";
import NavBar from "../../components/NavBar";

const LoginCandidatPage = () => {
    return (
        <>
            <NavBar/>
            <div className="flex flex-col md:flex-row items-center mt-16">
                <div className="md:w-1/2 px-4 md:px-20">
                    <LoginForm loginFor={"candidate"}/>
                </div>
                <div className="w-0 px-4 md:w-1/2 mt-4 md:mt-0">
                    <img
                        src="/images/photo-login.jpg"
                        className="rounded-3xl w-full md:w-4/5 mx-auto"
                        alt="image-signup"
                    />
                </div>
            </div>
        </>
    );
};

export default LoginCandidatPage;
