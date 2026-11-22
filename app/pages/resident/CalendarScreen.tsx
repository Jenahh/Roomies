import { randomUUID } from '../../utils/randomUUID';
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { ResidentData } from '../../hooks/useResidentData';
import type { PetMood } from '../../data/roomiePetMood';
import { styles as dashboardStyles } from '../../styles/ResidentDashboard.styles';
import { styles as s } from '../../styles/CalendarScreen.styles';
import Icon, { type IconName } from '../../components/dashboard/DashboardIcon';
import type { ChoreLook } from '../../data/chorePresets';
import { ChoreBadge } from '../../features/scheduler/ChoreBadge';
import RoomiePet from '../../components/RoomiePet';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const readDate = (key: string) => new Date(key + 'T12:00:00');
const dayLabel = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const categories = {
  chore: { label: 'Chores', dot: '#38805F', background: '#EAF6EF' },
  bill: { label: 'Bills', dot: '#A66316', background: '#FFF2DC' },
  event: { label: 'Events', dot: '#5B62BD', background: '#EDF0FF' },
} as const;
type EventLook = { title: string; icon: IconName; tint: string; ink: string };
const householdEvent: EventLook = { title: 'Household event', icon: 'calendar', tint: '#EDF0FF', ink: '#5355AD' };
const customEvent: EventLook = { title: 'Custom event', icon: 'sparkles', tint: '#FCE8ED', ink: '#8E4259' };
const eventPresets: EventLook[] = [
  { title: 'House dinner', icon: 'dinner', tint: '#FFF2DC', ink: '#79521E' },
  { title: 'Roommate meeting', icon: 'group', tint: '#EAF6EF', ink: '#315F46' },
  { title: 'Study session', icon: 'study', tint: '#E8F0FF', ink: '#345295' },
  { title: 'Game night', icon: 'game', tint: '#F0E9FC', ink: '#64428A' },
  { title: 'Grocery run', icon: 'basket', tint: '#ECF4DC', ink: '#47602B' },
  householdEvent,
  customEvent,
];

function AgendaIcon({ icon, tint, ink }: Pick<EventLook, 'icon' | 'tint' | 'ink'>) {
  return <View pointerEvents="none" style={[s.categoryBadge, { backgroundColor: tint }]}>
    <Icon name={icon} size={20} color={ink} />
  </View>;
}

const weekdayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const eventTimes = [null, ...Array.from({ length: 48 }, (_, index) => (index + 16) % 48)];
const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const formatTime = (slot: number) => `${hours[Math.floor(slot / 2) % 12]}:${slot % 2 ? '30' : '00'} ${slot < 24 ? 'AM' : 'PM'}`;
type CalendarItem = { id: string; title: string; date: string; detail: string } & (
  { kind: 'event'; custom?: boolean } | { kind: 'chore'; look?: ChoreLook } | { kind: 'bill' }
);
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function MonthCard({ month, selected, today, itemsByDay, onMonth, onDay, weekOnly = false }: {
  month: Date; selected: string | null; today: string; itemsByDay?: Map<string, CalendarItem[]>;
  onMonth: (month: Date) => void; onDay: (day: string) => void; weekOnly?: boolean;
}) {
  const startOffset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weeks = Array.from({ length: Math.ceil((startOffset + days) / 7) }, (_, week) =>
    weekdayNames.map((_, index) => new Date(month.getFullYear(), month.getMonth(), 1 - startOffset + week * 7 + index)));
  const weekAnchor = readDate(selected ?? today);
  const weekStart = new Date(weekAnchor);
  weekStart.setDate(weekAnchor.getDate() - (weekAnchor.getDay() + 6) % 7);
  const visibleWeeks = weekOnly ? [weekdayNames.map((_, index) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index))] : weeks;
  function navigate(offset: number) {
    if (!weekOnly) {
      onMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
      return;
    }
    const next = new Date(weekAnchor);
    next.setDate(next.getDate() + offset * 7);
    onDay(dateKey(next));
  }
  return <View style={[s.calendar, weekOnly && s.weekCard]}>
    <View style={s.monthHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel={weekOnly ? 'Previous week' : 'Previous month'} onPress={() => navigate(-1)} style={s.arrow}><Text style={s.arrowText}>‹</Text></Pressable>
      <Text numberOfLines={1} accessibilityRole="header" accessibilityLiveRegion="polite" style={s.monthTitle}>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={weekOnly ? 'Next week' : 'Next month'} onPress={() => navigate(1)} style={s.arrow}><Text style={s.arrowText}>›</Text></Pressable>
    </View>
    {!weekOnly && <View style={s.week}>{weekdayNames.map(day => <Text key={day} numberOfLines={1} style={s.weekdayText}>{day}</Text>)}</View>}
    {visibleWeeks.map(week => <View key={dateKey(week[0])} style={[s.week, weekOnly ? s.weekCards : s.monthWeek]}>
      {week.map((day, dayIndex) => {
        const key = dateKey(day);
        const active = key === selected;
        const current = key === today;
        const outside = day.getMonth() !== month.getMonth();
        const entries = itemsByDay?.get(key) ?? [];
        const kinds = [...new Set(entries.map(entry => entry.kind))];
        return <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          accessibilityLabel={`${dayLabel(day)}${current ? ', today' : ''}${itemsByDay ? `, ${entries.length} scheduled` : ''}`}
          onPress={() => onDay(key)}
          style={[s.dayCell, weekOnly && s.weekDayCard, weekOnly && s.emptyDay,
            weekOnly && entries.length > 0 && s.scheduledDay,
            weekOnly && current && !active && s.currentWeekDay,
            weekOnly && active && s.activeDay, !weekOnly && s.monthDayCell]}
        >
          {weekOnly && <Text numberOfLines={1} style={[s.weekDayLabel, active && s.activeDayText]}>{weekdayNames[dayIndex]}</Text>}
          <View style={[s.dayNumber,
            !weekOnly && s.emptyDay,
            !weekOnly && entries.length > 0 && s.scheduledDay,
            !weekOnly && current && s.today,
            !weekOnly && active && s.activeDay,
          ]}>
            <Text numberOfLines={1} style={[s.dayText, weekOnly && s.weekDate, !weekOnly && outside && s.outside, active && s.activeDayText]}>{day.getDate()}</Text>
          </View>
          <View style={s.dots}>{kinds.map(kind => <View key={kind} style={[s.dot, { backgroundColor: weekOnly && active ? '#FFFFFF' : categories[kind].dot }]} />)}</View>
        </Pressable>;
      })}
    </View>)}
    {itemsByDay && <View style={s.legend}>{Object.entries(categories).map(([kind, category]) => <View key={kind} style={s.legendItem}>
      <View style={[s.dot, { backgroundColor: category.dot }]} /><Text style={s.legendText}>{category.label}</Text>
    </View>)}</View>}
  </View>;
}

export default function CalendarScreen({ data, setData, mood, storageError, editing = false, renderPage, onAdd, onCancel, roommates = [], onOpenSection }: {
  data: ResidentData; setData: Dispatch<SetStateAction<ResidentData>>; mood: PetMood; storageError: string;
  editing?: boolean; renderPage?: (content: ReactNode) => ReactNode; onAdd?: () => void; onCancel?: () => void; roommates?: { id: string; name: string }[];
  onOpenSection?: (section: 'Chores' | 'Expenses') => void;
}) {
  const today = dateKey(new Date());
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [monthView, setMonthView] = useState(false);
  const [selected, setSelected] = useState<string>(today);
  const [eventType, setEventType] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const isCustom = eventType === 'Custom event';
  const title = isCustom ? customTitle.trim() : eventType;
  const [date, setDate] = useState(today);
  const [pickerMonth, setPickerMonth] = useState(() => monthStart(new Date()));
  const [timeSlot, setTimeSlot] = useState<number | null>(null);
  const time = timeSlot === null ? '' : formatTime(timeSlot);
  const [attendees, setAttendees] = useState('Everyone');
  const [picker, setPicker] = useState<'type' | 'date' | 'time' | 'people' | null>(null);
  const [detail, setDetail] = useState<CalendarItem | null>(null);
  const items: CalendarItem[] = [
    ...data.chores.filter(item => !item.completed).map(item => ({ id: item.id, title: item.title, date: item.due, detail: [item.time, item.unassigned ? 'Unassigned' : item.assignee || data.name].filter(Boolean).join(' · '), look: item.look, kind: 'chore' as const })),
    ...data.expenses.filter(item => !item.settled).map(item => ({ id: item.id, title: item.title, date: item.due, detail: `Your share ${currency.format(item.amount)}`, kind: 'bill' as const })),
    ...data.events.map(item => ({ id: item.id, title: item.title, date: item.date, detail: [item.time || 'All day', item.attendees || 'Everyone'].join(' · '), custom: item.custom, kind: 'event' as const })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const itemsByDay = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const dayItems = itemsByDay.get(item.date) ?? [];
    dayItems.push(item);
    itemsByDay.set(item.date, dayItems);
  }
  const monthKey = dateKey(month).slice(0, 7);
  const visible = itemsByDay.get(selected) ?? [];

  useEffect(() => {
    if (!editing) return;
    const initialDate = selected ?? (monthKey === today.slice(0, 7) ? today : dateKey(month));
    setEventType('');
    setCustomTitle('');
    setDate(initialDate);
    setPickerMonth(monthStart(readDate(initialDate)));
    setTimeSlot(null);
    setAttendees('Everyone');
    setPicker(null);
  }, [editing]);

  function chooseDay(day: string) {
    setMonth(monthStart(readDate(day)));
    setSelected(day);
    setDetail(null);
  }

  function save() {
    if (!title) return;
    const event = { id: randomUUID(), title, date, time, custom: isCustom, attendees: attendees === 'Just me' ? data.name : attendees };
    setData(previous => ({ ...previous, events: [...previous.events, event] }));
    chooseDay(date);
    onCancel?.();
  }

  const togglePicker = (value: typeof picker) => setPicker(picker === value ? null : value);
  const people = ['Everyone', 'Just me', ...roommates.map(person => person.name)];

  function renderAgendaItem(item: CalendarItem, index = 0) {
    const expanded = detail?.id === item.id && detail.kind === item.kind;
    const category = categories[item.kind];
    const look = item.kind === 'event'
      ? item.custom ? customEvent : eventPresets.find(preset => preset.title === item.title) ?? householdEvent
      : { icon: 'expenses' as const, tint: category.background, ink: category.dot };
    return <View key={`${item.kind}-${item.id}`} style={index > 0 && s.itemDivider}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setDetail(expanded ? null : item)} style={s.item}>
        {item.kind === 'chore' ? <ChoreBadge look={item.look} title={item.title} /> : <AgendaIcon icon={look.icon} tint={look.tint} ink={look.ink} />}
        <View style={s.copy}>
          <Text numberOfLines={1} style={s.itemTitle}>{item.title}</Text>
        </View>
      </Pressable>
      {expanded && <View style={s.itemDetails}>
        <Text numberOfLines={1} style={s.subtitle}>{dayLabel(readDate(item.date))}</Text>
        <Text numberOfLines={1} style={s.subtitle}>{item.detail}</Text>
        {item.kind !== 'event' && onOpenSection && <Pressable accessibilityRole="button" onPress={() => onOpenSection(item.kind === 'chore' ? 'Chores' : 'Expenses')} style={s.action}><Text style={s.link}>Open {item.kind === 'chore' ? 'Chores' : 'Expenses'}</Text></Pressable>}
      </View>}
    </View>;
  }

  const eventForm = <>
    <View style={s.header}>
      <Text numberOfLines={1} accessibilityRole="header" style={s.title}>Add event</Text>
      <Pressable accessibilityRole="button" onPress={onCancel} style={s.action}><Text style={s.link}>Cancel</Text></Pressable>
    </View>
    {!!storageError && <Text numberOfLines={1} accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.form}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Event type, ${eventType || 'choose a preset'}`} accessibilityState={{ expanded: picker === 'type' }} onPress={() => togglePicker('type')} style={s.field}>
        <Text style={s.label}>Event type</Text>
        <Text numberOfLines={1} style={s.fieldValue}>{eventType || 'Choose'}  ▾</Text>
      </Pressable>
      {picker === 'type' && <View accessibilityRole="radiogroup" accessibilityLabel="Event presets" style={s.presetList}>
        {eventPresets.map(preset => <Pressable key={preset.title} accessibilityRole="radio" accessibilityState={{ checked: eventType === preset.title }} onPress={() => { setEventType(preset.title); setPicker(null); }} style={[s.preset, eventType === preset.title && s.selectedChoice]}>
          <AgendaIcon icon={preset.icon} tint={preset.tint} ink={preset.ink} />
          <Text numberOfLines={1} style={s.choiceText}>{preset.title}</Text>
        </Pressable>)}
      </View>}
      {isCustom && <TextInput accessibilityLabel="Custom event name" placeholder="Name your event" value={customTitle} onChangeText={setCustomTitle} style={s.customInput} />}
      <Pressable accessibilityRole="button" accessibilityLabel={`Date, ${dayLabel(readDate(date))}`} accessibilityState={{ expanded: picker === 'date' }} onPress={() => togglePicker('date')} style={s.field}>
        <Text style={s.label}>Date</Text><Text numberOfLines={1} style={s.fieldValue}>{dayLabel(readDate(date))}  ▾</Text>
      </Pressable>
      {picker === 'date' && <MonthCard month={pickerMonth} selected={date} today={today} onMonth={setPickerMonth} onDay={day => { setDate(day); setPickerMonth(monthStart(readDate(day))); setPicker(null); }} />}
      <Pressable accessibilityRole="button" accessibilityLabel={`Time, ${time || 'All day'}`} accessibilityState={{ expanded: picker === 'time' }} onPress={() => togglePicker('time')} style={s.field}>
        <Text style={s.label}>Time</Text><Text numberOfLines={1} style={s.fieldValue}>{time || 'All day'}  ▾</Text>
      </Pressable>
      {picker === 'time' && <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={s.timePicker} contentContainerStyle={s.presetList} accessibilityRole="radiogroup" accessibilityLabel="Event time">
        {eventTimes.map(slot =>
          <Pressable key={slot ?? 'all-day'} accessibilityRole="radio" accessibilityState={{ checked: timeSlot === slot }} onPress={() => { setTimeSlot(slot); setPicker(null); }} style={[s.preset, timeSlot === slot && s.selectedChoice]}>
            <Text numberOfLines={1} style={s.choiceText}>{slot === null ? 'All day' : formatTime(slot)}</Text>
          </Pressable>
        )}
      </ScrollView>}
      <Pressable accessibilityRole="button" accessibilityLabel={`Attendees, ${attendees}`} accessibilityState={{ expanded: picker === 'people' }} onPress={() => togglePicker('people')} style={s.field}><Text style={s.label}>Attendees</Text><Text numberOfLines={1} style={s.fieldValue}>{attendees}  ▾</Text></Pressable>
      {picker === 'people' && <View style={s.choices}>{[...new Set(people)].map(person => <Pressable key={person} accessibilityRole="radio" accessibilityState={{ checked: attendees === person }} onPress={() => { setAttendees(person); setPicker(null); }} style={[s.choice, attendees === person && s.selectedChoice]}>
        <Text numberOfLines={1} style={s.choiceText}>{person}</Text>
      </Pressable>)}</View>}
      <Pressable accessibilityRole="button" disabled={!title} onPress={save} style={[s.save, !title && s.disabled]}><Text style={s.saveText}>Save event</Text></Pressable>
    </View>
  </>;

  if (editing) return renderPage ? renderPage(eventForm) : eventForm;

  const calendar = <>
    <View style={s.header}>
      <View style={s.calendarTitle}>
        <Text numberOfLines={1} accessibilityRole="header" style={s.title}>Calendar</Text>
        <RoomiePet action="calendar" color={data.pet?.color} mood={mood} size={44} />
      </View>
      {(monthKey !== today.slice(0, 7) || (selected && selected !== today)) && <Pressable accessibilityRole="button" onPress={() => chooseDay(today)} style={s.action}><Text style={s.link}>Today</Text></Pressable>}
    </View>
    {!!storageError && <Text numberOfLines={1} accessibilityRole="alert" style={s.error}>{storageError}</Text>}
    <View style={s.viewToggle} accessibilityRole="radiogroup" accessibilityLabel="Calendar view">
      {['Week', 'Month'].map((label, index) => <Pressable key={label} accessibilityRole="radio" accessibilityState={{ checked: monthView === Boolean(index) }} onPress={() => setMonthView(Boolean(index))} style={[s.viewOption, monthView === Boolean(index) && s.selectedChoice]}>
        <Text numberOfLines={1} style={s.choiceText}>{label}</Text>
      </Pressable>)}
    </View>
    <MonthCard month={month} selected={selected} today={today} itemsByDay={itemsByDay} weekOnly={!monthView} onMonth={next => {
      const preferredDay = Math.min(readDate(selected).getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
      chooseDay(dateKey(new Date(next.getFullYear(), next.getMonth(), preferredDay)));
    }} onDay={chooseDay} />
  </>;

  const agendaHeading = (
    <View style={[s.header, s.agendaHeader]}>
      <Text numberOfLines={1} accessibilityRole="header" style={s.sectionTitle}>{selected === today ? 'Today’s plans' : dayLabel(readDate(selected))}</Text>
      <View style={s.agendaActions}>
        {onAdd && <Pressable accessibilityRole="button" accessibilityLabel="Add event" onPress={onAdd} style={({ pressed }) => [dashboardStyles.quickAddButton, s.agendaAdd, pressed && dashboardStyles.pressed]}>
          <Icon name="add" color="#FFFFFF" size={25} />
        </Pressable>}
      </View>
    </View>
  );
  const agendaItems = <>
    {visible.length ? <View style={s.list}>{visible.map(renderAgendaItem)}</View> : <View style={s.list}>
      <View style={s.item}>
        <RoomiePet action="calendar" color={data.pet?.color} mood={mood} size={30} />
        <Text numberOfLines={1} style={s.itemTitle}>Nothing planned</Text>
      </View>
    </View>}
  </>;

  const page = <>{calendar}{agendaHeading}{agendaItems}</>;
  return renderPage ? renderPage(page) : page;
}
