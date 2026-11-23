import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import RoomiePet from '../RoomiePet';
import type { PetMood } from '../../data/roomiePetMood';
import type { MemberSummary, SettlementPlan } from '../../features/settlement/ledger';
import type { Transfer } from '../../features/settlement/settlement';
import { formatBalance, formatCents, summarizePlan } from '../../features/settlement/explain';
import { styles as s } from '../../styles/ExpensesScreen.styles';

type SettleUpAssistantProps = {
  plan: SettlementPlan;
  summaries: MemberSummary[];
  me: string;
  /** The short label for a person, for instance, "You" or "Maya". */
  labelOf: (id: string) => string;
  petColor?: string;
  mood: PetMood;
  onRecord: (transfer: Transfer) => void;
};

/**
 * The honors option feature, which suggests the fewest payments that settle every balance in the household, shows how each balance was worked out, 
 * and lets the payer/recipient mark a payment as paid.
 */
export default function SettleUpAssistant({ plan, summaries, me, labelOf, petColor, mood, onRecord }: SettleUpAssistantProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  const { pairwise, greedy, optimal } = plan.comparison;
  const people = summaries.filter(item => item.paidCents || item.shareCents || item.balanceCents);

  return (
    <View style={s.assistant} accessibilityLabel="Settle-up assistant">
      <View style={s.assistantHeader}>
        <RoomiePet action="expenses" color={petColor} mood={plan.transfers.length ? mood : 'happy'} size={48} />
        <View style={s.copy}>
          <Text accessibilityRole="header" style={s.assistantTitle}>Settle up</Text>
          <Text style={s.assistantSummary}>{summarizePlan(plan)}</Text>
        </View>
      </View>

      {plan.transfers.length > 0 && (
        <View style={s.transfers}>
          {plan.transfers.map((transfer, index) => {
            const mine = transfer.from === me || transfer.to === me;
            return (
              <View key={transfer.from + transfer.to + index} style={index < plan.transfers.length - 1 && s.divider}>
                <View style={s.transfer}>
                  <Text style={s.transferNames}>{labelOf(transfer.from)} → {labelOf(transfer.to)}</Text>
                  <Text style={s.transferAmount}>{formatCents(transfer.cents)}</Text>
                  {mine && confirming !== index && (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${formatCents(transfer.cents)} from ${labelOf(transfer.from)} to ${labelOf(transfer.to)} as paid`} onPress={() => setConfirming(index)} style={({ pressed }) => [s.markPaid, pressed && s.pressed]}>
                      <Text style={s.markPaidText}>Paid</Text>
                    </Pressable>
                  )}
                </View>
                {confirming === index && (
                  <View style={s.confirmButtons}>
                    <Pressable accessibilityRole="button" onPress={() => { setConfirming(null); onRecord(transfer); }} style={({ pressed }) => [s.markPaid, pressed && s.pressed]}><Text style={s.markPaidText}>Confirm paid</Text></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => setConfirming(null)} style={({ pressed }) => [s.textButton, pressed && s.pressed]}><Text style={s.link}>Cancel</Text></Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {plan.transfers.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={s.why}>
          <Text style={s.link}>{open ? 'Hide' : 'How it works'}</Text>
          <Text style={s.link}>{open ? '˄' : '˅'}</Text>
        </Pressable>
      )}

      {open && (
        <View style={s.explanation}>
          <View style={s.compare}>
            <View style={s.compareTile}><Text style={s.compareValue}>{pairwise}</Text><Text style={s.compareLabel}>Pay each person back</Text></View>
            <View style={s.compareTile}><Text style={s.compareValue}>{greedy}</Text><Text style={s.compareLabel}>Simple matching</Text></View>
            <View style={[s.compareTile, s.compareBest]}><Text style={s.compareValue}>{optimal}</Text><Text style={s.compareLabel}>Assistant</Text></View>
          </View>
          {people.map(item => (
            <View key={item.id} style={s.listRow}>
              <Text style={s.explainName}>{labelOf(item.id)}</Text>
              <Text style={s.explainMath}>Paid {formatCents(item.paidCents)} · Share {formatCents(item.shareCents)}{item.sentCents || item.receivedCents ? ' · Settled ' + formatBalance(item.sentCents - item.receivedCents) : ''}</Text>
              <Text style={[s.explainBalance, item.balanceCents > 0 && s.positive, item.balanceCents < 0 && s.negative]}>{formatBalance(item.balanceCents)}</Text>
            </View>
          ))}
          <Text style={s.hint}>{plan.method === 'exact' ? 'Balance = paid − share. The assistant checks every way to group people whose balances cancel out, then picks the fewest payments.' : 'Balance = paid − share. Large household, so a faster method was used.'}</Text>
        </View>
      )}
    </View>
  );
}
