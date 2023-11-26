import React from 'react'

type Props = {}

export default function Subscription({}: Props) {
  return (
    <section className="relative w-full pb-10 mx-auto my-10 md:w-8/12">
    <div
      className="md:h-[70px] md:w-[70px] w-[40px] h-[40px] right-0 bg-gradient-to-r rounded-full grid place-items-center absolute md:-right-5 -top-5 from-primary to-[#8ac36b] z-10 p-1">
      <img src="/images/send.svg" />
    </div>

    <div className="relative">
      <div
        className="overflow-hidden relative w-full h-96 bg-optional1  md:rounded-b-2xl md:rounded-tr-2xl md:rounded-tl-[6rem]">
      </div>

      <div className="absolute hidden md:block -right-24 -bottom-16">
        <img src="/images/bottom-pattern.svg" role="none" />
      </div>
      <div className="absolute top-0 flex items-center w-full h-full">
        <div className="flex flex-col items-center max-w-2xl mx-auto my-16">
          <h1 className="max-w-sm text-xl leading-normal text-center text-secondary md:max-w-full md:text-2xl font-semibold font-default">
            Subscribe to get information, latest news and other interesting
            offers about Facejob
          </h1>
          <div className="flex flex-col w-full gap-5 mt-10 md:flex-row md:mt-20">
            <div className="relative w-full text-gray-600">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <label htmlFor="email" className="p-1">
                  <img src="/images/email.svg" role="none" className="w-6 h-6" />
                </label>
              </span>
              <input type="email" name="q"
                className="p-5 pl-12 text-sm bg-white font-default rounded-lg w-full md:h-[55px] focus:outline-none"
                placeholder="email@example.com" autoComplete="off" id="email" required />
            </div>

            <button
              className="bg-gradient-to-r inline-block from-primary to-primary font-default px-7 py-2 rounded-lg text-white text-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}