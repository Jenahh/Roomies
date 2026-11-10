import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from '../../styles/ResidentDashboard.styles';
import Icon from './DashboardIcon';
import type { IconName } from './DashboardIcon';

export type DashboardTab = { label: string; icon: IconName };

const defaultTabs: DashboardTab[] = [
  { label: 'Home', icon: 'home' }, { label: 'Chores', icon: 'chores' },
  { label: 'Expenses', icon: 'expenses' }, { label: 'Calendar', icon: 'calendar' }, { label: 'Profile', icon: 'profile' },
];

type DashboardNavigationProps = {
  activeTab: string;
  onNavigate: (tab: string) => void;
  tabs?: DashboardTab[];
  showLabels?: boolean;
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
};

export default function DashboardNavigation({ activeTab, onNavigate, tabs = defaultTabs, showLabels = false, style, iconStyle }: DashboardNavigationProps) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel="Main navigation" style={[styles.navigation, style]}>
      {tabs.map(tab => (
        <Pressable key={tab.label} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected: tab.label === activeTab }} onPress={() => onNavigate(tab.label)} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
          <View style={[styles.navIcon, tab.label === activeTab && styles.activeNav, iconStyle]}>
            <Icon name={tab.icon} color={tab.label === activeTab ? '#657EEA' : '#737783'} size={20} />
          </View>
          {showLabels && <Text style={[styles.navLabel, tab.label === activeTab && styles.activeLabel]}>{tab.label}</Text>}
        </Pressable>
      ))}
    </View>
  );
}
