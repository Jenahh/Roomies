import { Fragment, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import RoomiePet from '../RoomiePet';
import type { PetMood } from '../../data/roomiePetMood';
import type { MemberSummary, SettlementPlan } from '../../features/settlement/ledger';
import type { Transfer } from '../../features/settlement/settlement';
import { explainBalance, explainTransfers, formatCents, methodLabel, summarizePlan } from '../../features/settlement/explain';
import { styles as s } from '../../styles/ExpensesScreen.styles';

type SettleUpAssistantProps = {
  plan: SettlementPlan;
  summaries: MemberSummary[];
  me: string;
  /** The name for sentences, for instance, "Jordan (you)". */
  nameOf: (id: string) => string;
  /** The short label for payment rows, for example, "You". */
  labelOf: (id: string) => string;
  petColor?: string;
  mood: PetMood;
  onRecord: (transfer: Transfer) => void;
};

/**
 * The honors option portion: suggests the fewest payments that settle every balance in the household, explains each one in plain 
 * language, and lets the payer/recipient record it as paid.
 */
export default function SettleUpAssistant({ plan, summaries, me, nameOf, labelOf, petColor, mood, onRecord }: SettleUpAssistantProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  const explanations = explainTransfers(plan, nameOf);
  const involved = summaries.filter(summary => summary.balanceCents !== 0 || summary.paidCents || summary.shareCents);
  const { pairwise, greedy, optimal } = plan.comparison;

  return (
    <View style={s.assistant} accessibilityLabel="Settle-up assistant">
      <View style={s.assistantHeader}>
        <RoomiePet action="expenses" color={petColor} mood={plan.transfers.length ? mood : 'happy'} size={56} />
        <View style={s.copy}>
          <Text accessibilityRole="header" style={s.assistantTitle}>Settle-up assistant</Text>
          <Text style={s.assistantSummary}>{summarizePlan(plan)}</Text>
        </View>
      </View>

      {plan.transfers.length > 0 && (
        <View style={s.transfers}>
          {plan.transfers.map((transfer, index) => {
            const canRecord = transfer.from === me || transfer.to === me;
            return (
              <View key={transfer.from + transfer.to + index} style={index < plan.transfers.length - 1 && s.divider}>
                <View style={s.transfer}>
                  <Text style={s.transferNames}>{labelOf(transfer.from)} → {labelOf(transfer.to)}</Text>
                  <Text style={s.transferAmount}>{formatCents(transfer.cents)}</Text>
                  {canRecord
                    ? <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${formatCents(transfer.cents)} from ${labelOf(transfer.from)} to ${labelOf(transfer.to)} as paid`} onPress={() => setConfirming(index)} style={({ pressed }) => [s.markPaid, pressed && s.pressed]}><Text style={s.markPaidText}>Mark paid</Text></Pressable>
                    : <Text style={s.waiting}>{labelOf(transfer.from)} or {labelOf(transfer.to)} can mark this paid</Text>}
                </View>
                {confirming === index && (
                  <View style={s.confirm}>
                    <Text style={s.hint}>{transfer.from === me ? `Confirm you sent ${labelOf(transfer.to)} ${formatCents(transfer.cents)}?` : `Confirm ${labelOf(transfer.from)} sent you ${formatCents(transfer.cents)}?`} Everyone's balances will update.</Text>
                    <View style={s.confirmButtons}>
                      <Pressable accessibilityRole="button" onPress={() => { setConfirming(null); onRecord(transfer); }} style={({ pressed }) => [s.markPaid, pressed && s.pressed]}><Text style={s.markPaidText}>Yes, it's paid</Text></Pressable>
                      <Pressable accessibilityRole="button" onPress={() => setConfirming(null)} style={({ pressed }) => [s.secondaryButton, { minHeight: 34 }, pressed && s.pressed]}><Text style={s.link}>Cancel</Text></Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {involved.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showWhy }} onPress={() => setShowWhy(!showWhy)} style={s.why}>
          <Text style={s.link}>{showWhy ? 'Hide explanation' : 'Why these payments?'}</Text>
          <Text style={s.link}>{showWhy ? '˄' : '˅'}</Text>
        </Pressable>
      )}

      {showWhy && (
        <View style={s.explanation}>
          {plan.transfers.length > 0 && <>
            <Text style={s.explainHeading}>Fewer payments for everyone</Text>
            <View style={s.compare}>
              <View style={s.compareTile}><Text style={s.compareValue}>{pairwise}</Text><Text style={s.compareLabel}>Paying each roommate back separately</Text></View>
              <View style={s.compareTile}><Text style={s.compareValue}>{greedy}</Text><Text style={s.compareLabel}>Simple matching (largest first)</Text></View>
              <View style={[s.compareTile, s.compareBest]}><Text style={s.compareValue}>{optimal}</Text><Text style={s.compareLabel}>Assistant's plan (fewest possible)</Text></View>
            </View>
            <Text style={s.explainHeading}>Each payment</Text>
            {explanations.map((sentence, index) => <Text key={index} style={s.explainText}>{index + 1}. {sentence}</Text>)}
          </>}
          <Text style={s.explainHeading}>How balances are worked out</Text>
          <Text style={s.explainText}>Each bill is split equally between the people sharing it. A balance is what someone paid for the household, minus their share, adjusted for payments already made between roommates. All balances add up to zero.</Text>
          {involved.map(summary => <Fragment key={summary.id}><Text style={s.explainText}>{explainBalance(summary, nameOf)}</Text></Fragment>)}
          {plan.groups.length > 1 && <Text style={s.explainText}>The assistant found {plan.groups.length} separate groups whose balances cancel out on their own ({plan.groups.map(group => group.map(labelOf).join(', ')).join(' · ')}), so each group settles among themselves.</Text>}
          <Text style={s.hint}>{methodLabel(plan)}</Text>
        </View>
      )}
    </View>
  );
}
