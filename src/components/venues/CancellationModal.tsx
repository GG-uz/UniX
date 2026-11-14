'use client';

import React, { useState } from 'react';
import { Venue, Slot, SportType, DISCIPLINE_LIST } from '@/types';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Lock,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getDisciplineLabel } from '@/lib/utils';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue;
  slot: Slot;
  onConfirm: (params: {
    sportType: SportType;
    isSplitPayment: boolean;
    paymentMethod: 'UZUM' | 'PAYME' | 'CLICK' | 'STRIPE';
    matchDescription: string;
  }) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  venue,
  slot,
  onConfirm,
}) => {
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isSplit, setIsSplit] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'UZUM' | 'PAYME' | 'CLICK' | 'STRIPE'>('PAYME');
  const [sportType, setSportType] = useState<SportType>(venue.sportTypes[0] || 'FOOTBALL');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const slotStart = new Date(slot.startTime);
  const cancellationDeadline = new Date(slotStart.getTime() - 48 * 60 * 60 * 1000);

  const totalAmount = slot.price;
  const payNowAmount = isSplit ? totalAmount / 2 : totalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToPolicy) return;

    onConfirm({
      sportType,
      isSplitPayment: isSplit,
      paymentMethod,
      matchDescription: description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Бронирование &amp; Правило 48 Часов</h3>
              <p className="text-xs text-neutral-400 truncate max-w-xs">{venue.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Slot Summary */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Выбранное время слота
              </span>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatDate(slot.startTime)} • {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">{venue.surfaceType}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Полный тариф
              </span>
              <span className="text-base font-black text-amber-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Discipline Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Дисциплина встречи
            </label>
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value as SportType)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {venue.sportTypes.map((sp) => (
                <option key={sp} value={sp}>
                  {getDisciplineLabel(sp)}
                </option>
              ))}
            </select>
          </div>

          {/* Match Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Описание матча / Тема вызова
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: TEAM University ищет соперника на дерби 5х5 или олимпиадный матбой..."
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Split Payment Toggle */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Схема оплаты аренды
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSplit(true)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSplit
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> 50/50 Сплит
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Вы платите: <strong className="text-amber-400">{formatCurrency(totalAmount / 2)}</strong>. Соперник доплатит свою часть при принятии.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsSplit(false)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !isSplit
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" /> 100% Предоплата
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Полная бронь слота: <strong className="text-amber-400">{formatCurrency(totalAmount)}</strong>.
                </div>
              </button>
            </div>
          </div>

          {/* Strict 48H Cancellation Rule Box */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Строгая Политика Отмены (Дедлайн: 48 часов)</span>
            </div>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              Крайний срок бесплатной отмены:
            </p>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-amber-500/30 text-center font-black text-amber-300 text-xs">
              до {formatDate(cancellationDeadline.toISOString())} в {formatTime(cancellationDeadline.toISOString())}
            </div>
            <ul className="space-y-1.5 text-[11px] text-neutral-400 pt-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Более 48ч до игры:</strong> 100% возврат средств на ваш счет.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Менее 48ч до игры:</strong> Депозит полностью сгорает и перечисляется площадке за простой.</span>
              </li>
            </ul>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Способ оплаты
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['PAYME', 'CLICK', 'UZUM', 'STRIPE'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === method
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-md'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {method === 'UZUM' ? 'Uzum Bank' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory Checkbox Agreement */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className="accent-amber-500 w-4 h-4 rounded mt-0.5 cursor-pointer"
            />
            <span className="text-[11px] text-neutral-300 leading-tight">
              Я ознакомился и согласен с <strong className="text-white">Политикой 48 часов</strong>. Я понимаю, что при отмене менее чем за 48 часов до матча мой депозит не возвращается.
            </span>
          </label>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!agreedToPolicy}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
              agreedToPolicy
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 cursor-pointer shadow-orange-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Оплатить {formatCurrency(payNowAmount)} &amp; Зафиксировать Слот
          </button>
        </form>
      </div>
    </div>
  );
};
