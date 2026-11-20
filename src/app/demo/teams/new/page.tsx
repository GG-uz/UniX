import { Hero } from '@/components/ecosystem/Atlas';
import { ProposalForm } from '@/components/demo-teams/ProposalForm';

export default function NewTeam() {
  return <><Hero tag="Шаг 01 / Предложение студента" title="Новая команда">Соберите учебную команду. Можно сохранить черновик или сразу передать его на рассмотрение.</Hero><ProposalForm/></>;
}
