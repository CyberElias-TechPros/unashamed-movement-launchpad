import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";

const journey = [
  {
    year: "21st Feb 2025",
    title: "Posted a video of myself preaching open air on a plane",
    desc: "",
  },
  {
    year: "Feb 22nd - 24th",
    title: "Others Joined in",
    desc: "Other people preached in buses, on the streets after seeing my video",
  },
  {
    year: "24th February",
    title: "TTIN Launches",
    desc: "The official Movement was Launched",
  },
];

const About = () => {
  return (
    <Layout>
      <PageHero kicker="Our Story" title="About Us" />

      {/* How It Started */}
      <section
        className="page-section full-bleed-section section-theme-bright-inverse"
        data-test="page-section"
        data-section-theme="bright-inverse"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28">
            <p className="font-mono text-[#eab308] text-xs tracking-[0.2em] uppercase mb-4">
              How It Started
            </p>
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
              <div className="w-full lg:w-5/12 template-fade-in template-visible">
                <div className="aspect-[9/16] rounded-[20px] overflow-hidden bg-[#0a0a0a] relative">
                  <img
                    src="/images/about-story.jpg"
                    alt="Preaching open air — where it all started"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="w-full lg:w-7/12">
                <div className="rounded-[20px] bg-[#e8dccc] p-8 lg:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a]/10 to-transparent" />
                  </div>
                  <p className="font-body text-[#0a0a0a] text-xl leading-relaxed mb-6">
                    It's February 2025. I'm sitting in a Pastor's training program, listening to my
                    Pastor, Pastor Chris Oyakhilome, talk about Christians who preach open air. And
                    the way he's talking about them... it's different. There's honor in his voice,
                    almost like heaven itself is proud of people who live that boldly.
                  </p>
                  <p className="font-body text-[#0a0a0a] text-xl leading-relaxed mb-6">
                    While he's ministering, the Holy Spirit speaks to me so clearly. He says,{" "}
                    <strong>"This shouldn't be rare. This is supposed to be normal."</strong> He
                    showed me that boldness for Christ isn't for a "special few". It's the standard.
                    Every Christian is meant to be daring. Unashamed. Public.
                  </p>
                  <p className="font-body text-[#0a0a0a] text-xl leading-relaxed mb-6">
                    Then the Lord showed me a vision of myself preaching on the plane back home. He
                    said, 'You know what you have to do.' I didn't argue, I didn't negotiate. I
                    just said, 'Yes, Lord. I'll do it.'
                  </p>
                  <p className="font-body text-[#0a0a0a] text-xl leading-relaxed mb-6">
                    So I did. I preached, recorded it and I posted it on Instagram. And honestly? I
                    didn't expect what happened next. The video started spreading. Shares. Messages.
                    Comments. But then one message stopped me in my tracks. A lady told me she
                    watched the video, and it inspired her to preach on a bus. After she preached,
                    two other Christians who were there got stirred and they also were inspired to
                    preach on buses.
                  </p>
                  <p className="font-body text-[#0a0a0a] text-xl leading-relaxed mb-6">
                    That's when it hit me. This wasn't just a moment, it was a movement. And that's
                    how The Time Is Now was born.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section
        className="page-section full-bleed-section section-theme-bright-inverse"
        data-test="page-section"
        data-section-theme="bright-inverse"
      >
        <div className="section-border" />
        <div className="section-background" />
        <div className="content-wrapper">
          <div className="content container-custom py-20 md:py-28" style={{ maxWidth: "768px" }}>
            <h2 className="font-heading text-4xl sm:text-5xl tracking-wider text-[#0a0a0a] text-center mb-16">
              Our Journey
            </h2>
            <ol className="relative border-l border-[#eab308]/40 pl-8 space-y-10">
              {journey.map((item) => (
                <li key={item.year} className="relative">
                  <span className="absolute -left-[2.35rem] w-4 h-4 rounded-full bg-[#eab308]" />
                  <p className="font-mono text-[#eab308] text-xs tracking-wider uppercase">
                    {item.year}
                  </p>
                  <h3 className="font-heading text-xl text-[#0a0a0a] mt-1">{item.title}</h3>
                  {item.desc && (
                    <p className="font-body text-[#0a0a0a]/60 mt-2">{item.desc}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
