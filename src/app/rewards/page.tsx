
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Gift, PlusCircle, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link'; // Import Link

// Mock data - replace with real data
const rewardsPrograms = [
    { id: 'rew_1', name: 'Standard Points Program', type: 'Points', status: 'Active', pointsPerSurvey: 10, redemptionOptions: 3 },
    { id: 'rew_2', name: 'Gift Card Raffle Q3', type: 'Raffle', status: 'Active', entryPerSurvey: 1, prizes: 5 },
    { id: 'rew_3', name: 'Early Bird Bonus', type: 'Bonus', status: 'Inactive', bonusAmount: '$5 Coupon', condition: 'First 100 responses' },
];

const recentRedemptions = [
    { id: 'red_1', userId: 'user_abc', userName: 'John D.', reward: '$10 Amazon Card', pointsCost: 100, date: '2024-04-28' },
    { id: 'red_2', userId: 'user_xyz', userName: 'Jane S.', reward: 'Product Sample Box', pointsCost: 50, date: '2024-04-25' },
];

export default function RewardsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <Award className="h-6 w-6" /> Rewards Management
        </h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Reward Program
        </Button>
      </div>

      {/* Reward Programs Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Programs</CardTitle>
          <CardDescription>Manage incentives for survey participation.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Program Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                         <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rewardsPrograms.map((program) => (
                        <TableRow key={program.id}>
                            <TableCell className="font-medium">{program.name}</TableCell>
                            <TableCell>{program.type}</TableCell>
                            <TableCell>
                                <Badge variant={program.status === 'Active' ? 'default' : 'outline'}
                                    className={program.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}>
                                    {program.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {program.type === 'Points' && `${program.pointsPerSurvey} points/survey, ${program.redemptionOptions} options`}
                                {program.type === 'Raffle' && `${program.entryPerSurvey} entry/survey, ${program.prizes} prizes`}
                                {program.type === 'Bonus' && `${program.bonusAmount} (${program.condition})`}
                            </TableCell>
                             <TableCell>
                                {/* Add Edit/View Details actions */}
                                <Button variant="ghost" size="sm">Edit</Button>
                             </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
      </Card>

      {/* Redemption Options / Catalog */}
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Redemption Catalog</CardTitle>
          <CardDescription>Define items or rewards users can redeem.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage gift cards, coupons, merchandise, or other items available for redemption.
            (Placeholder Content - List/Grid of redeemable items)
          </p>
            <div className="mt-4 border rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="font-medium">$10 Amazon Gift Card</p>
                    <p className="text-sm text-muted-foreground">Points Cost: 100</p>
                </div>
                 <Button variant="outline" size="sm">Edit</Button>
           </div>
        </CardContent>
      </Card>


      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>Track rewards claimed by users.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Points Cost</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentRedemptions.map((redemption) => (
                         <TableRow key={redemption.id}>
                            <TableCell>{redemption.userName} ({redemption.userId})</TableCell>
                            <TableCell>{redemption.reward}</TableCell>
                            <TableCell className="text-muted-foreground">{redemption.pointsCost}</TableCell>
                            <TableCell className="text-muted-foreground">{redemption.date}</TableCell>
                         </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
      </Card>
    </div>
  );
}
