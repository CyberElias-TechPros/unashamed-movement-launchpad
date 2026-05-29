export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  social?: { instagram?: string; youtube?: string };
}

export const teamMembers: TeamMember[] = [
  {
    name: "Movement Founder",
    role: "Founder & Lead Preacher",
    bio: "Started preaching on a plane in February 2025, sparking a global movement across 16 countries.",
    social: { instagram: "https://instagram.com/_thetimeisnow", youtube: "https://youtube.com/@TheTimeIsNow255" },
  },
  {
    name: "Outreach Director",
    role: "Global Outreach",
    bio: "Coordinates open-air preaching teams and equips believers with practical evangelism tools.",
  },
  {
    name: "Resources Lead",
    role: "Content & Discipleship",
    bio: "Oversees the free resource library and training materials for bold faith living.",
  },
];
