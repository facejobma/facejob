import React from "react";
import NavBar from "../../../components/NavBar";

const Blog2Page: React.FC = () => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-1 p-10 flex flex-col justify-center items-center w-1/2 font-default">
        <h1 className="text-3xl font-semibold mb-6">Blog 2</h1>
        <div className="bg-white p-6 rounded-md shadow-md ">
          <img
            src="/img2.jpg" 
            alt="Blog 1 Image"
            className="mb-4 rounded-md w-full mx-auto"
          />
          <h2 className="text-xl font-semibold mb-2">Blog 2 Title</h2>
          <p>
            This is the content of Blog 2. It can be a long description of the
            blog.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog2Page;
