export type PortfolioImage = {
  src: string;
  alt: string;
};

export type NavigationItem = {
  label: string;
  href: string;
};

export type FeaturedProject = {
  title: string;
  description: string;
  image: PortfolioImage;
  ctaLabel: string;
  ctaHref: string;
};

export type SkillItem = {
  label: string;
  icon: string;
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type FooterSocial = {
  type: string;
  href: string;
};

export type PortfolioData = {
  version: string;
  profile: {
    name: string;
    roleHeadline: string;
    heroCtaText: string;
    avatarImage: PortfolioImage;
  };
  navigation: NavigationItem[];
  featuredProjects: {
    title: string;
    items: FeaturedProject[];
  };
  skills: {
    title: string;
    items: SkillItem[];
  };
  newsletter: {
    enabled: boolean;
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
  };
  footer: {
    columns: FooterColumn[];
    social: FooterSocial[];
    copyright: string;
  };
};
