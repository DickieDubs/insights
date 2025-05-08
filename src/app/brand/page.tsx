
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, ArrowLeft, UploadCloud, Palette, PenTool, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { BrandProfile } from '@/types';
import { getBrandProfile, updateBrandProfile } from '@/lib/firebase/firestore-service';

const defaultBrandData: Omit<BrandProfile, 'id' | 'updatedAt'> = {
  companyName: '',
  primaryColor: '#0B72B9',
  secondaryColor: '#60A5FA',
  toneOfVoice: '',
  logoUrl: '',
};

export default function BrandPage() {
  const [brandData, setBrandData] = useState<Omit<BrandProfile, 'id' | 'updatedAt'>>(defaultBrandData);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadBrandData() {
      setIsLoading(true);
      try {
        const profile = await getBrandProfile();
        if (profile) {
          setBrandData({
            companyName: profile.companyName,
            primaryColor: profile.primaryColor,
            secondaryColor: profile.secondaryColor,
            toneOfVoice: profile.toneOfVoice,
            logoUrl: profile.logoUrl,
          });
          setLogoPreview(profile.logoUrl || null);
        } else {
          // If no profile exists, it means getBrandProfile created and returned a default one.
          // We can set the form with defaultBrandData or the one possibly returned.
          // For simplicity, assume getBrandProfile handles default creation if null is initially returned.
          // This case should ideally be handled by getBrandProfile returning a default.
          setBrandData(defaultBrandData);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error loading brand profile',
          description: (error as Error).message || 'Could not fetch brand details.',
        });
      }
      setIsLoading(false);
    }
    loadBrandData();
  }, [toast]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrandData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (colorName: 'primaryColor' | 'secondaryColor', value: string) => {
    setBrandData(prev => ({ ...prev, [colorName]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setLogoPreview(dataUri);
        // In a real app, you'd upload this file and get a URL.
        // For this version, we'll store the Data URI. Be mindful of Firestore document size limits.
        // For production, use Firebase Storage to upload the image and store the URL.
        setBrandData(prev => ({ ...prev, logoUrl: dataUri })); 
        toast({ title: "Logo Preview Updated", description: "Remember to save changes to persist the new logo."});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateBrandProfile(brandData);
      toast({
        title: 'Brand Profile Saved',
        description: 'Your brand identity has been successfully updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Brand Profile',
        description: (error as Error).message || 'Could not save brand details.',
      });
    }
    setIsSaving(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6">
         <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
             <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading Brand Profile...
            </h1>
        </div>
        <Card>
            <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="h-10 bg-muted rounded animate-pulse w-1/2"></div>
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-muted animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse w-1/3"></div>
                </div>
                <div className="h-24 bg-muted rounded animate-pulse"></div>
                <div className="h-24 bg-muted rounded animate-pulse"></div>
            </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Brand Management
        </h1>
        <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Identity</CardTitle>
          <CardDescription>Manage your brand's visual identity and core messaging.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name */}
          <div>
            <Label htmlFor="companyName" className="flex items-center gap-1 mb-1"><PenTool className="h-4 w-4 text-muted-foreground" /> Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={brandData.companyName}
              onChange={handleInputChange}
              placeholder="Your Company LLC"
              disabled={isSaving}
            />
          </div>

          {/* Brand Logo */}
          <div className="space-y-2">
            <Label htmlFor="logoUpload" className="flex items-center gap-1"><UploadCloud className="h-4 w-4 text-muted-foreground" /> Brand Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-muted">
                <AvatarImage src={logoPreview || undefined} alt={brandData.companyName || "Logo"} data-ai-hint="company logo placeholder" />
                <AvatarFallback>{brandData.companyName ? brandData.companyName.substring(0, 2).toUpperCase() : 'LG'}</AvatarFallback>
              </Avatar>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="max-w-xs"
                disabled={isSaving}
              />
            </div>
            <p className="text-xs text-muted-foreground">Recommended: Square image, PNG or JPG, max 2MB. Using Data URI for preview; for production, upload to cloud storage.</p>
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Palette className="h-4 w-4 text-muted-foreground" /> Color Palette</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor" className="text-sm font-normal">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={brandData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                    disabled={isSaving}
                  />
                  <Input
                    type="text"
                    value={brandData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    placeholder="#0B72B9"
                    className="flex-1"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor" className="text-sm font-normal">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    name="secondaryColor"
                    type="color"
                    value={brandData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                    disabled={isSaving}
                  />
                  <Input
                    type="text"
                    value={brandData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    placeholder="#60A5FA"
                    className="flex-1"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tone of Voice */}
          <div>
            <Label htmlFor="toneOfVoice" className="flex items-center gap-1 mb-1"><PenTool className="h-4 w-4 text-muted-foreground" /> Tone of Voice</Label>
            <Textarea
              id="toneOfVoice"
              name="toneOfVoice"
              value={brandData.toneOfVoice}
              onChange={handleInputChange}
              placeholder="Describe your brand's communication style..."
              rows={4}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">Define how your brand communicates with its audience.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Guidelines</CardTitle>
          <CardDescription>Define and enforce brand consistency (Feature Coming Soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow uploading or defining detailed brand guidelines for consistent use across all campaigns and surveys.
            (Placeholder Content)
          </p>
          <Button variant="outline" className="mt-4" disabled>Upload Guidelines</Button>
        </CardContent>
      </Card>
    </div>
  );
}
