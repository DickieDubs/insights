// src/lib/firebase/seed-data.ts
import {
  addClient,
  addCampaign,
  addSurvey,
  updateBrandProfile,
  addRewardProgram,
  addRedemptionItem,
  updateUserPreferences,
  addConsumer, // Added addConsumer
  // getClientById, // To avoid duplicate client names
} from './firestore-service';
import type { ClientFormValues, CampaignFormValues, SurveyFormValues, RewardProgram, RedemptionItem, BrandProfile, UserPreferences, ConsumerFormValues } from '@/types'; // Added ConsumerFormValues
import { Timestamp } from 'firebase/firestore';

const seedData = async () => {
  console.log('Starting data seeding...');

  try {
    // --- Seed Brand Profile ---
    const brandProfileData: Omit<BrandProfile, 'id' | 'updatedAt'> = {
      companyName: 'InsightPulse Demo',
      logoUrl: 'https://picsum.photos/seed/insightpulse_logo/128/128',
      primaryColor: '#003049', // Ocean Blue
      secondaryColor: '#D6D3D1', // Light Gray
      toneOfVoice: 'Professional, insightful, and approachable. We aim to empower users with data-driven clarity.',
    };
    await updateBrandProfile(brandProfileData);
    console.log('Brand profile seeded/updated.');

    // --- Seed User Preferences (for default user) ---
    const userPreferencesData: Partial<Omit<UserPreferences, 'id' |'updatedAt'>> = {
        receiveNotifications: true,
        theme: 'system',
    };
    await updateUserPreferences('defaultUser', userPreferencesData);
    console.log('Default user preferences seeded/updated.');


    // --- Seed Clients ---
    const clientsToSeed: ClientFormValues[] = [
      { name: 'Gourmet Bites Inc.', industry: 'Food & Beverage', contactPerson: 'Alice Wonderland', email: 'alice@gourmetbites.com', phone: '555-0101-1111', status: 'Active' },
      { name: 'Liquid Refreshments Co.', industry: 'Beverages', contactPerson: 'Bob The Builder', email: 'bob@liquidrefresh.com', phone: '555-0102-2222', status: 'Active' },
      { name: 'Morning Foods Ltd.', industry: 'CPG', contactPerson: 'Charlie Brown', email: 'charlie@morningfoods.com', status: 'Pending' },
      { name: 'Quick Eats Corp.', industry: 'Frozen Foods', contactPerson: 'Diana Prince', email: 'diana@quickeats.com', status: 'Active' },
      { name: 'Healthy Snacks Co.', industry: 'Health Foods', contactPerson: 'Edward Nigma', email: 'edward@healthysnacks.com', status: 'Inactive' },
    ];

    const clientIds: { [name: string]: string } = {};

    for (const clientData of clientsToSeed) {
        const clientId = await addClient(clientData);
        clientIds[clientData.name] = clientId;
        console.log(`Added client: ${clientData.name} (ID: ${clientId})`);
    }

    // --- Seed Campaigns ---
    const campaignsToSeed: CampaignFormValues[] = [
      { title: 'Spring Snack Launch', clientId: clientIds['Gourmet Bites Inc.'], productType: 'Snacks', status: 'Active', startDate: new Date('2024-03-01'), endDate: new Date('2024-04-30'), targetAudience: 'Millennials, Urban Dwellers', description: 'Launch campaign for new spring snack line.' },
      { title: 'Beverage Taste Test Q2', clientId: clientIds['Liquid Refreshments Co.'], productType: 'Beverages', status: 'Completed', startDate: new Date('2024-04-15'), endDate: new Date('2024-05-15'), targetAudience: 'Gen Z, College Students', description: 'Quarterly taste testing for new beverage concepts.' },
      { title: 'New Cereal Concept', clientId: clientIds['Morning Foods Ltd.'], productType: 'Cereal', status: 'Planning', startDate: new Date('2024-06-01'), endDate: new Date('2024-07-01'), targetAudience: 'Families with Kids' },
      { title: 'Frozen Meals Feedback', clientId: clientIds['Quick Eats Corp.'], productType: 'Frozen Meals', status: 'Active', startDate: new Date('2024-05-10'), endDate: new Date('2024-06-10'), targetAudience: 'Busy Professionals' },
      { title: 'Healthy Bar Evaluation', clientId: clientIds['Healthy Snacks Co.'], productType: 'Snacks', status: 'Paused', startDate: new Date('2024-07-15'), endDate: new Date('2024-08-15'), targetAudience: 'Fitness Enthusiasts' },
    ];

    const campaignIds: { [title: string]: string } = {};
    for (const campaignData of campaignsToSeed) {
      if (!campaignData.clientId) {
          console.warn(`Skipping campaign "${campaignData.title}" due to missing client ID.`);
          continue;
      }
      const campaignId = await addCampaign(campaignData);
      campaignIds[campaignData.title] = campaignId;
      console.log(`Added campaign: ${campaignData.title} (ID: ${campaignId})`);
    }

    // --- Seed Reward Programs ---
    const rewardProgramsToSeed: Omit<RewardProgram, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { name: 'Standard Points Program', type: 'Points', status: 'Active', description: 'Earn points for each survey completed.', config: { pointsPerSurvey: 10 } },
        { name: 'Gift Card Raffle Q3', type: 'Raffle', status: 'Active', description: 'Get a raffle entry for a chance to win gift cards.', config: { entryPerSurvey: 1 } },
        { name: 'Early Bird Bonus', type: 'Bonus', status: 'Inactive', description: 'Special bonus for the first 100 respondents.', config: { bonusAmount: '$5 Coupon', condition: 'First 100 responses' } },
    ];
    const rewardProgramIds: { [name: string]: string } = {};
    for (const rpData of rewardProgramsToSeed) {
        const rpId = await addRewardProgram(rpData);
        rewardProgramIds[rpData.name] = rpId;
        console.log(`Added reward program: ${rpData.name} (ID: ${rpId})`);
    }


    // --- Seed Surveys ---
    const surveysToSeed: SurveyFormValues[] = [
      { name: 'Initial Concept Test', campaignId: campaignIds['Spring Snack Launch'], status: 'Active', type: 'Concept Test', rewardProgramId: rewardProgramIds['Standard Points Program'], questions: [ { text: 'How appealing is this snack concept?', type: 'rating' }, { text: 'Which flavor profile sounds most interesting?', type: 'multiple-choice', options: [{value: 'Spicy Mango'}, {value: 'Garlic Parmesan'}, {value: 'Sweet Chili'}] }, { text: 'Any suggestions for improvement?', type: 'text' } ] },
      { name: 'Packaging Preference', campaignId: campaignIds['Spring Snack Launch'], status: 'Completed', type: 'Preference Test', rewardProgramId: null, questions: [ { text: 'Which packaging design do you prefer?', type: 'multiple-choice', options: [{value: 'Design A'}, {value: 'Design B'}, {value: 'Design C'}] } ] },
      { name: 'Taste Profile Analysis', campaignId: campaignIds['Spring Snack Launch'], status: 'Planning', type: 'Sensory Test', rewardProgramId: rewardProgramIds['Standard Points Program'], questions: [] },
      { name: 'Flavor Preference Ranking', campaignId: campaignIds['Beverage Taste Test Q2'], status: 'Completed', type: 'Ranking', rewardProgramId: rewardProgramIds['Gift Card Raffle Q3'], questions: [ { text: 'Rank these potential new flavors (1=most preferred)', type: 'ranking', options: [{value: 'Berry Blast'}, {value: 'Citrus Zing'}, {value: 'Tropical Twist'}] } ] },
      { name: 'Brand Perception Survey', campaignId: campaignIds['Beverage Taste Test Q2'], status: 'Completed', type: 'Brand Study', rewardProgramId: null, questions: [] },
      { name: 'Cereal Box Design Feedback', campaignId: campaignIds['New Cereal Concept'], status: 'Draft', type: 'Design Feedback', rewardProgramId: null, questions: [] },
    ];

    for (const surveyData of surveysToSeed) {
        if (!surveyData.campaignId) {
          console.warn(`Skipping survey "${surveyData.name}" due to missing campaign ID.`);
          continue;
        }
      await addSurvey(surveyData);
      console.log(`Added survey: ${surveyData.name}`);
    }


    // --- Seed Redemption Items ---
    const redemptionItemsToSeed: Omit<RedemptionItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { name: '$5 Amazon Gift Card', type: 'Gift Card', pointsCost: 50, stock: 100, isActive: true, description: 'Redeem for a $5 Amazon gift card.' },
        { name: '$10 Starbucks Card', type: 'Gift Card', pointsCost: 100, stock: 50, isActive: true, imageUrl: 'https://picsum.photos/seed/starbucks/64' },
        { name: '20% Off Coupon - GourmetBites', type: 'Coupon', pointsCost: 25, isActive: true, description: 'Get 20% off your next purchase at Gourmet Bites.' },
        { name: 'Branded Water Bottle', type: 'Merchandise', pointsCost: 150, stock: 20, isActive: false, imageUrl: 'https://picsum.photos/seed/waterbottle/64' },
    ];
    for (const itemData of redemptionItemsToSeed) {
        await addRedemptionItem(itemData);
        console.log(`Added redemption item: ${itemData.name}`);
    }

    // --- Seed Consumers ---
    const consumersToSeed: ConsumerFormValues[] = [
      { name: 'Alice Wonderland', email: 'alice.consumer@example.com', segment: 'Early Adopter', notes: 'Very active in providing feedback, interested in organic products.' },
      { name: 'Bob The Builder', email: 'bob.consumer@example.com', segment: 'Value Seeker', notes: 'Prefers discounts and bulk offers.' },
      { name: 'Charlie Brown', email: 'charlie.consumer@example.com', segment: 'Brand Loyalist', notes: 'Loyal to Morning Foods Ltd. products.' },
      { name: 'Diana Prince', email: 'diana.consumer@example.com', segment: 'Tech Enthusiast', notes: 'Engages with surveys on mobile devices primarily.' },
      { name: 'Edward Nigma', email: 'edward.consumer@example.com', segment: 'Occasional Buyer', notes: 'Participates in surveys sporadically.' },
    ];
    for (const consumerData of consumersToSeed) {
      await addConsumer(consumerData);
      console.log(`Added consumer: ${consumerData.name}`);
    }


    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error during data seeding:', error);
  }
};

if (require.main === module) {
  seedData();
}

export default seedData;
