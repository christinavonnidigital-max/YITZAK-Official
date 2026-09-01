import { Pillar } from './types';

export const PILLARS: Pillar[] = [
  {
    id: 'training',
    title: 'Professional Training',
    icon: 'school',
    description: 'Practical, instructor-led training that builds knowledge, competence, and confidence across management systems and industry disciplines. This is the heart of our business.',
    details: [
      'Yitzak professional programmes',
      'Selected FoodChain ID Academy courses',
      'Corporate & in-house delivery',
      'Customised learning pathways'
    ]
  },
  {
    id: 'consulting',
    title: 'Consulting & Advisory',
    icon: 'support_agent',
    description: 'Practical guidance to implement learning, improve systems, and strengthen overall organisational performance.',
    details: [
      'Gap assessments & readiness reviews',
      'Management system development',
      'Documentation & records support',
      'Internal audits & process reviews'
    ]
  },
  {
    id: 'certification',
    title: 'Certification Pathways',
    icon: 'verified',
    description: 'Through our partnership with FoodChain ID, we help organisations prepare for suitable certification routes across food safety, quality, and agricultural standards.',
    details: [
      'Guidance on suitable certification routes',
      'FoodChain ID scheme preparation & advisory',
      'GFSI, BRCGS, FSSC 22000 & ISO readiness reviews',
      'GLOBALG.A.P. & Non-GMO pathway support',
      'Independent certification issued by accredited certification bodies'
    ]
  },
  {
    id: 'process_implementation',
    title: 'Business Process Implementation',
    icon: 'schema',
    description: 'Helping organisations build operational foundations from zero, spanning process mapping, governance, and extension into HR, Accounting, and operational systems.',
    details: [
      'Phase 1: Process Mapping & Risk Controls',
      'Phase 1: ISO/FSSC System Readiness',
      'Phase 2: Operational Efficiency & Lean Audits',
      'HR, Accounting & Operational Systems Integration'
    ]
  }
];

export const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
];

export const APPROACH_STEPS = [
  {
    num: 1,
    title: 'Discover',
    description: 'Understand your organisation, objectives, and challenges.'
  },
  {
    num: 2,
    title: 'Assess',
    description: 'Evaluate current capability, systems, and opportunities.'
  },
  {
    num: 3,
    title: 'Develop',
    description: 'Design practical solutions aligned with your goals.'
  },
  {
    num: 4,
    title: 'Deliver',
    description: 'Implement training, consulting, and improvement programmes.'
  },
  {
    num: 5,
    title: 'Improve',
    description: 'Support continual improvement through ongoing partnership.'
  }
];

export const TRAINING_STREAMS = [
  {
    id: 'academy',
    kicker: 'Yitzak Programme',
    title: 'Yitzak Professional Programmes',
    description: 'Our own courses, developed around practical industry needs and delivered by experienced facilitators. This is where our expertise lives.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfnxvXuGPx63Lf1_RPo8IPYqlbrT3deq2nG0muPHTDo4DvgOdSbGDLY6Jig2NuIHx-xgFTgd8n9cD67OVCI3GvInFhFkVXkweGrOZ5x7D1hiCFujE73VJhOsenrc030dj8oPgB3ukyKK3-2yHDhLcxTxnqtyhQqxN4jamKcPUda7DuifKZ-xaVl0SOO_maJcBNDQB3QcNju64L2kFue_Wk2-uM0JqO7m2Vs1bO4XH6FQsWPlTLdtPp'
  },
  {
    id: 'foodchain',
    kicker: 'FoodChain ID Course',
    title: 'FoodChain ID Academy',
    description: 'A trusted partner in our portfolio, giving clients access to a respected global range of internationally recognised courses.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRdGCDAe5YayYKRjrTKFPBBR34JK_ulUgp6xz92eP-ZLP_smKlwfpScfIMKskDmqHo8bauCn3H3Y7EQVCm-fnO8yx4KvSKLKvjtRqruQeK0ZCTbcbBZTrfE0e--1qcGAJemAaxNM2AqkgXMQqpCP8QNyHJt2gsePt8FoEwX6FxKsKlFOU2mn9DUi_XjHzSdK5XwVGfP0oIHdoKBmUVhW3z3zQ-gt2orjmK-eyebsqSQTizEdDsk1rm'
  },
  {
    id: 'bespoke',
    kicker: 'Yitzak Programme',
    title: 'Corporate Learning Solutions',
    description: 'Customised training built around your people and systems, delivered on-site, virtually, or blended.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI27jv44rFeAk1JqmBzl_g9S9LnQSaJ63OrNThYydyww8_P2twtoLG5_O5YcG5mFHiVDovtbLAfXitx53TEDVT3a8-FAlangFMnCuBnOY2ukQ-Zdy8_6aa4BSHPjsWa2cxyc_DmyOLiAWjk5NJMbNJLkZYZ1ex0is_xFU4Vapx2jwuSAwK1hrMet2MbqsRubC83_cADvpiAKuMy0ORV02S8xwv6EaR9CJNEtEa-ggcsFx8hGadvSXe'
  }
];
