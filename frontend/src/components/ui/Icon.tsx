import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export type IconName =
  | 'shield'
  | 'shield-checkmark'
  | 'arrow-back'
  | 'notifications'
  | 'search'
  | 'filter'
  | 'person'
  | 'location'
  | 'time'
  | 'calendar'
  | 'phone'
  | 'call'
  | 'mic'
  | 'mic-off'
  | 'camera'
  | 'document'
  | 'alert-circle'
  | 'close'
  | 'checkmark'
  | 'checkmark-circle'
  | 'chevron-forward'
  | 'options'
  | 'star'
  | 'lock'
  | 'lock-closed'
  | 'card'
  | 'wallet'
  | 'map'
  | 'eye'
  | 'radio'
  | 'swap'
  | 'upload'
  | 'cloud-upload'
  | 'download'
  | 'share'
  | 'home'
  | 'briefcase'
  | 'activity'
  | 'user'
  | 'settings'
  | 'alert-triangle'
  | 'award'
  | 'refresh'
  | 'log-out'
  | 'information-circle'
  | 'volume-high'
  | 'volume-medium'
  | 'call-end';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = Colors.text,
  style,
}) => {
  switch (name) {
    case 'shield':
      return <Ionicons name="shield-outline" size={size} color={color} style={style} />;
    case 'shield-checkmark':
      return <Ionicons name="shield-checkmark" size={size} color={color} style={style} />;
    case 'arrow-back':
      return <Ionicons name="arrow-back" size={size} color={color} style={style} />;
    case 'notifications':
      return <Ionicons name="notifications-outline" size={size} color={color} style={style} />;
    case 'search':
      return <Ionicons name="search-outline" size={size} color={color} style={style} />;
    case 'filter':
      return <Ionicons name="options-outline" size={size} color={color} style={style} />;
    case 'person':
    case 'user':
      return <Ionicons name="person-outline" size={size} color={color} style={style} />;
    case 'location':
      return <Ionicons name="location-outline" size={size} color={color} style={style} />;
    case 'time':
      return <Ionicons name="time-outline" size={size} color={color} style={style} />;
    case 'calendar':
      return <Ionicons name="calendar-outline" size={size} color={color} style={style} />;
    case 'phone':
    case 'call':
      return <Ionicons name="call-outline" size={size} color={color} style={style} />;
    case 'call-end':
      return <Ionicons name="call" size={size} color={color} style={style} />;
    case 'mic':
      return <Ionicons name="mic-outline" size={size} color={color} style={style} />;
    case 'mic-off':
      return <Ionicons name="mic-off-outline" size={size} color={color} style={style} />;
    case 'volume-high':
      return <Ionicons name="volume-high-outline" size={size} color={color} style={style} />;
    case 'volume-medium':
      return <Ionicons name="volume-medium-outline" size={size} color={color} style={style} />;
    case 'camera':
      return <Ionicons name="camera-outline" size={size} color={color} style={style} />;
    case 'document':
      return <Ionicons name="document-text-outline" size={size} color={color} style={style} />;
    case 'alert-circle':
      return <Ionicons name="alert-circle-outline" size={size} color={color} style={style} />;
    case 'alert-triangle':
      return <Ionicons name="warning-outline" size={size} color={color} style={style} />;
    case 'information-circle':
      return <Ionicons name="information-circle-outline" size={size} color={color} style={style} />;
    case 'close':
      return <Ionicons name="close" size={size} color={color} style={style} />;
    case 'checkmark':
      return <Ionicons name="checkmark-sharp" size={size} color={color} style={style} />;
    case 'checkmark-circle':
      return <Ionicons name="checkmark-circle-outline" size={size} color={color} style={style} />;
    case 'chevron-forward':
      return <Ionicons name="chevron-forward" size={size} color={color} style={style} />;
    case 'options':
      return <Ionicons name="ellipsis-vertical" size={size} color={color} style={style} />;
    case 'star':
      return <Ionicons name="star" size={size} color={color} style={style} />;
    case 'lock':
    case 'lock-closed':
      return <Ionicons name="lock-closed-outline" size={size} color={color} style={style} />;
    case 'card':
    case 'wallet':
      return <Ionicons name="card-outline" size={size} color={color} style={style} />;
    case 'map':
      return <Ionicons name="map-outline" size={size} color={color} style={style} />;
    case 'eye':
      return <Ionicons name="eye-outline" size={size} color={color} style={style} />;
    case 'radio':
      return <Ionicons name="radio-button-on-outline" size={size} color={color} style={style} />;
    case 'swap':
      return <Ionicons name="swap-horizontal" size={size} color={color} style={style} />;
    case 'upload':
    case 'cloud-upload':
      return <Ionicons name="cloud-upload-outline" size={size} color={color} style={style} />;
    case 'download':
      return <Ionicons name="download-outline" size={size} color={color} style={style} />;
    case 'share':
      return <Ionicons name="share-social-outline" size={size} color={color} style={style} />;
    case 'home':
      return <Ionicons name="home-outline" size={size} color={color} style={style} />;
    case 'briefcase':
      return <Ionicons name="briefcase-outline" size={size} color={color} style={style} />;
    case 'activity':
      return <Ionicons name="pulse-outline" size={size} color={color} style={style} />;
    case 'settings':
      return <Ionicons name="settings-outline" size={size} color={color} style={style} />;
    case 'award':
      return <Ionicons name="ribbon-outline" size={size} color={color} style={style} />;
    case 'refresh':
      return <Ionicons name="refresh-outline" size={size} color={color} style={style} />;
    case 'log-out':
      return <Ionicons name="log-out-outline" size={size} color={color} style={style} />;
    default:
      return <Ionicons name="ellipse-outline" size={size} color={color} style={style} />;
  }
};
