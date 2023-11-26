import React from "react";

type Props = {};

export default function AboutUs({}: Props) {
  return (
    <section className="w-full p-8 md:p-20 mx-auto mt-32 mb-16 bg-white">
      <div className="w-full md:w-3/5 mx-auto text-center text-gray-800 md:text-start">
        <h2 className="my-4 text-3xl md:text-5xl font-bold text-center text-gray-800 font-default">
          About Us
        </h2>
        <div className="md:px-10">
          <p className="text-third font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-12 px-2 md:px-1 py-2 md:py-4">
            Welcome to{" "}
            <span className="text-primary font-semibold">FaceJob</span>, a
            cutting-edge platform committed to revolutionizing the job
            application experience. At the heart of our mission is a dedication
            to connecting exceptionally talented individuals with exciting
            career opportunities, transforming the traditional hiring process
            into one that is seamless, transparent, and ultimately rewarding.
          </p>
          <p className="text-third font-default font-medium text-base md:text-lg px-2 md:px-1 py-2">
            Born out of a shared passion for innovation and a belief in the
            transformative power of meaningful employment, FaceJob is more than
            just a job portal.
          </p>
        </div>

        <div className="w-[180px] h-[42px] relative mx-auto mt-12">
          <div className="w-[202px] h-[68px] left-0 top-0 absolute bg-optional1 rounded-[15px] border border-primary"></div>
          <div className="w-[175.36px] h-[29.33px] left-0 top-[16px] absolute text-right pr-2 text-primary text-[23px] font-bold font-default leading-normal">
            Know More
          </div>
        </div>
      </div>
    </section>
  );
}
