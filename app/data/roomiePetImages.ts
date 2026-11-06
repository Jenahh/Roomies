import type { PetMood } from './roomiePetMood';
import blueHappy from '../../assets/roomie pet emotions/Blue Roomie Pet Happy.png';
import blueAttention from '../../assets/roomie pet emotions/Blue Roomie Pet Attention.png';
import blueStressed from '../../assets/roomie pet emotions/Blue Roomie Pet Stressed.png';
import greenHappy from '../../assets/roomie pet emotions/Green Roomie Pet Happy.png';
import greenAttention from '../../assets/roomie pet emotions/Green Roomie Pet Attention.png';
import greenStressed from '../../assets/roomie pet emotions/Green Roomie Pet Stressed.png';
import purpleHappy from '../../assets/roomie pet emotions/Purple Roomie Pet Happy.png';
import purpleAttention from '../../assets/roomie pet emotions/Purple Roomie Pet Attention.png';
import purpleStressed from '../../assets/roomie pet emotions/Purple Roomie Pet Stressed.png';
import yellowHappy from '../../assets/roomie pet emotions/Yellow Roomie Pet Happy.png';
import yellowAttention from '../../assets/roomie pet emotions/Yellow Roomie Pet Attention.png';
import yellowStressed from '../../assets/roomie pet emotions/Yellow Roomie Pet Stressed.png';
import pinkHappy from '../../assets/roomie pet emotions/Pink Roomie Pet Happy.png';
import pinkAttention from '../../assets/roomie pet emotions/Pink Roomie Pet Attention.png';
import pinkStressed from '../../assets/roomie pet emotions/Pink Roomie Pet Stressed.png';

const petImages: Record<string, Record<PetMood, string>> = {
  Blue: { Happy: blueHappy, Attention: blueAttention, Stressed: blueStressed },
  Green: { Happy: greenHappy, Attention: greenAttention, Stressed: greenStressed },
  Purple: { Happy: purpleHappy, Attention: purpleAttention, Stressed: purpleStressed },
  Yellow: { Happy: yellowHappy, Attention: yellowAttention, Stressed: yellowStressed },
  Pink: { Happy: pinkHappy, Attention: pinkAttention, Stressed: pinkStressed },
};

export function getHatlessPetImage(color?: string, mood: PetMood = 'Happy') {
  return (petImages[color || 'Blue'] || petImages.Blue)[mood];
}
