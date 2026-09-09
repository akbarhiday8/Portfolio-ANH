export const portfolioData = {
  profile: {
    name: 'Akbar Nur',
    monogram: 'ANH',
    eyebrow: 'Discipline turns plans into progress',
    tagline: 'A Journey of Work, Learning & Creation.',
    introduction:
      'A multidisciplinary professional passionate about solving real problems through technology, structured thinking, and continuous learning.',
    about:
      'I work across technology, operations, administration, and documentation—bringing structure to complex work and turning ideas into practical outcomes.',
    artwork: '/profile-artwork.png',
  },
  statistics: [
    { value: '4+', label: 'Years Experience' },
    { value: '10+', label: 'Projects' },
    { value: '15+', label: 'Certifications' },
    { value: '∞', label: 'Continuous Learning' },
  ],
  capabilities: [
    { title: 'Education', description: 'A solid foundation', icon: 'book' },
    { title: 'Experience', description: 'Turning knowledge into practice', icon: 'briefcase' },
    { title: 'Training', description: 'Continuous improvement', icon: 'pencil' },
    { title: 'Projects', description: 'Ideas into real solutions', icon: 'grid' },
    { title: 'Certifications', description: 'Validated skills and expertise', icon: 'award' },
    { title: 'Interests', description: 'Exploring beyond the limits', icon: 'compass' },
  ],
  journey: [
    { period: '2018 — 2022', title: 'Education', description: 'Building the foundation' },
    { period: '2022 — 2023', title: 'First Steps', description: 'Entering the professional world' },
    { period: '2023 — 2024', title: 'Growth', description: 'Expanding skills and experience' },
    { period: '2024 — Present', title: 'New Horizons', description: 'Creating greater impact' },
  ],
  experience: [
    {
      index: '01',
      role: 'Operational Staff',
      organization: 'Professional Operations',
      period: '2020 — 2022',
      description: 'Supporting daily operations and improving workflow efficiency through clear, dependable execution.',
      tone: 'charcoal',
    },
    {
      index: '02',
      role: 'Administrative Support',
      organization: 'Business Administration',
      period: '2022 — 2024',
      description: 'Organizing records, coordinating processes, and keeping essential work moving accurately.',
      tone: 'paper',
    },
    {
      index: '03',
      role: 'Digital Project Contributor',
      organization: 'Independent Practice',
      period: '2024 — Present',
      description: 'Connecting research, technology, and documentation to create useful digital outcomes.',
      tone: 'crimson',
    },
  ],
  projects: [
    { index: '01', title: 'BYD Harmony Auto', category: 'Web Application', year: '2026', layout: 'wide' },
    { index: '02', title: 'Operations Archive', category: 'Operations · Documentation', year: '2025', layout: 'tall' },
    { index: '03', title: 'Reporting System', category: 'Data · Administration', year: '2025', layout: 'square' },
    { index: '04', title: 'Field Notes', category: 'Research · Professional Work', year: '2024', layout: 'wide' },
  ],
  certifications: [
    { name: 'IT Support', issuer: 'Professional Certification', year: '2025', category: 'Technology' },
    { name: 'Ethical Hacking', issuer: 'Professional Certification', year: '2025', category: 'Security' },
    { name: 'Excel Expert', issuer: 'Professional Certification', year: '2024', category: 'Productivity' },
    { name: 'Additional Certificates', issuer: 'Learning Archive', year: 'Ongoing', category: 'Development' },
  ],
  socials: [
    { label: 'LinkedIn', href: '#' },
    { label: 'Email', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
} as const;
