import React from "react";
import Link from "next/link";

type Props = {};

export default function AboutUs({}: Props) {
    return (
        <section className="flex flex-col-reverse md:flex-row w-full p-8 mt-8 md:mt-20 mb-8 md:mb-16 bg-white">
            <div className="w-full md:w-1/2 md:mt-10 md:ml-16">
                <div className="aspect-w-16 aspect-h-9">
                    <video
                        className="rounded-lg"
                        controls
                        muted
                        playsInline
                        poster="/videos/videoImage.png"
                    >
                        <source src="/videos/Facejob_VA_WEB.mp4" type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            <div className="w-full md:w-1/2  mt-4 md:mt-8  bg-white">
                <div className="text-center text-gray-800 md:text-start">
                    <div className="md:px-10">
                        <p className="text-third  font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-12 px-5 md:px-1 py-2 md:py-4 text-right">
                            فلسفتنا بسيطة: تقديم الفرصة لجميع الشركات، وجميع الباحثين عن العمل، للتفاعل و للتواصل بأسهل
                            طريقة على الإطلاق، وأكثر الطرق كفاءة على الإطلاق

                        </p>
                    </div>

                    <div className="w-1/3 mb-8 md:w-1/4  relative mx-auto mt-4 font-default">
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-secondary font-bold py-2 px-3 rounded-lg inline-flex items-center w-full justify-center ">
                            <Link href="/aboutusarabic/">
                                <span>اقرأ أكثر</span>
                            </Link>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
