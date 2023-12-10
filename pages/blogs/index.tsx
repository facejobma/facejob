import React from "react";
import NavBar from "../../components/NavBar";
import Link from "next/link";

const blogs = [
  {
    title: "Blog 1",
    content:
      "This is the content of Blog 1. It can be a long description of the blog.",
    link: "/blogs/blog1",
    image: "/img1.jpg",
  },
  {
    title: "Blog 2",
    content:
      "This is the content of Blog 2. It can be a long description of the blog.",
    link: "/blogs/blog2",
    image: "/img2.jpg",
  },
  {
    title: "Blog 3",
    content:
      "This is the content of Blog 3. It can be a long description of the blog.",
    link: "/blogs/blog3",
    image: "/img3.jpg",
  },
];

const BlogPage: React.FC = () => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-10 p-10 font-default">
        <h1 className="text-3xl font-semibold mb-6">Latest Blogs</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-md shadow-md transform transition-transform duration-700 hover:scale-105"
            >
              <div className="mb-4">
                <img
                  src={blog.image}
                  alt={`Blog ${index + 1}`}
                  className="w-full h-40 object-cover rounded-md"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">{blog.title}</h2>
                <p className="text-gray-600 mb-4">{blog.content}</p>
                <Link href={blog.link} className="text-primary hover:underline">
                  Read more
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
