"use client"
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function Page() {
    return (
        <div className="relative overflow-hidden font-default bg-gray-100">
            <NavBar/>
            <main className="container mx-auto p-10 md:p-28 bg-white rounded-md shadow-lg">
                <section className="mb-6">
                    <h1 className="text-3xl font-bold mb-8 border-b-2 border-primary pb-2 text-right">
                        في ما يخصنا
                    </h1>
                    <p className="text-third text-right font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-8 px-5 md:px-1 py-2 md:py-2">
                        فلسفتنا بسيطة: تقديم الفرصة لجميع الشركات، وجميع الباحثين عن العمل، للتفاعل و للتواصل بأسهل
                        طريقة على الإطلاق، وأكثر الطرق كفاءة على الإطلاق

                    </p>
                    <p className="text-third text-right font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        لسنوات عدة، بحثنا عن حلول لمشاكل التوظيف ... واكتشفنا أن مرحلة اللقاء و التواصل بين الشركات
                        والباحثين عن العمل، غالبًا ما كانت الأكثر أهمية ولكنها غالبًا ما تكون الأكثر إهمالًا

                    </p>
                    <p className="text-third text-right font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        ومن هذه القناعة القوية ولدت فكرة وضع التكنولوجيا الرقمية في خدمة هذا التواصل فأطلقنا فيسجوب في
                        سنة 2022 و ذلك حصريا عبر هذه المنصة و التي تعد سبقا في هذا المجال في المغرب

                    </p>
                    <p className="text-third text-right font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        مستوحى من فعالية وسائل التواصل الاجتماعي، يقدم فيسجوب مفهوم السيرة الذاتية بالفيديو. عادة و بهدف
                        السرعة في الأداء وتوفير الوقت، يتردد مسؤولو التوظيف في الاتصال بالباحثين عن العمل، من أجل إجراء
                        المقابلات، ما يجعلهم أحيانا يفوتون الفرصة لإيجاد المرشح المثالي لهذا المنصب
                    </p>
                    <p className="text-third text-right font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        بالنسبة للباحثين عن العمل، يُنظر إلى السيرة الذاتية الورقية على أنها مختزلة و ليست في الواقع
                        انعكاسًا لذاتهم. كما أن المرشح يحتاج لإثارة &apos;الشعور&apos;. لهاذا تضيف السيرة الذاتية بالفيديو العامل
                        الإنساني كما أنها تظهر المزيد عن طريقة التعامل و تعزز الفعالية في الاختيار وفي اللقاء.
                    </p>
                    <p className="text-third text-right font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        هدفنا هو جعل الباحثين عن العمل يبدون وكأنهم يلتقون بمسؤول التوظيف في الواقع و في ظروف مثالية
                    </p>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
