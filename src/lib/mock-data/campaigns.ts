export interface Campaign {
  id: string
  title: string
  clientId: string
  client: string
  status: string
  startDate: string
  endDate: string
  productType: string
  targetAudience: string
  detailedSurveys?: {
    id: string
    name: string
    status: string
    responses: number
  }[]
}

export const mockCampaignsData: Campaign[] = [
  {
    id: '1',
    title: 'Campaign 1',
    clientId: 'client1',
    client: 'Client A',
    status: 'Active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    productType: 'Electronics',
    targetAudience: 'Tech Enthusiasts',
    detailedSurveys: [
      {
        id: 'survey1',
        name: 'Survey 1',
        status: 'Active',
        responses: 120,
      },
      {
        id: 'survey2',
        name: 'Survey 2',
        status: 'Completed',
        responses: 300,
      },
    ],
  },
  {
    id: '2',
    title: 'Campaign 2',
    clientId: 'client2',
    client: 'Client B',
    status: 'Planning',
    startDate: '2025-06-01',
    endDate: '2025-11-30',
    productType: 'Fashion',
    targetAudience: 'Young Adults',
    detailedSurveys: [],
  },
  {
    id: '3',
    title: 'Campaign 3',
    clientId: 'client3',
    client: 'Client C',
    status: 'Completed',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    productType: 'Automotive',
    targetAudience: 'Car Enthusiasts',
    detailedSurveys: [
      {
        id: 'survey3',
        name: 'Survey 3',
        status: 'Completed',
        responses: 500,
      },
    ],
  },
]

export const getCampaignById = (id: string): Campaign | null => {
  return mockCampaignsData.find((campaign) => campaign.id === id) || null
}
