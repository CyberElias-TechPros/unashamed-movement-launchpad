import SectionWrapper from "@/components/SectionWrapper";

const VideoSection = () => {
  const videos = [
    { id: "pFyf6yPBr9A", title: "Being Ambitious for Christ", duration: "21:07" },
    { id: "ndP307bxp4k", title: "The Gospel Simplified", duration: "28:48" },
    { id: "ahIbBSvVoQs", title: "The Ministry of the Holy Spirit in Evangelism", duration: "1:25:44" },
    { id: "oxGmlhJDUq0", title: "Unashamed Webinar 3.0", duration: "2:00:11" },
  ];

  return (
    <section className="section-padding bg-primary">
      <div className="container-custom">
        <SectionWrapper>
          <div className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">
              The Movement
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl tracking-wider text-primary-foreground mb-6">
              The Time Is Now
            </h2>
            <p className="font-body text-primary-foreground/70 text-xl max-w-3xl mx-auto">
              Watch bold Christians preaching open air around the world and sharing their faith.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto video-container">
            {videos.map((video, index) => (
              <div key={video.id} className="relative bg-black rounded-2xl overflow-hidden aspect-video group">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?modestbranding=1&rel=0&showinfo=0&color=white`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-heading text-lg">{video.title}</p>
                  <span className="text-white/70 text-sm">{video.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
};

export default VideoSection;
