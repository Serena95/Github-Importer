import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface MentionListProps {
  items: UserProfile[];
  command: (item: any) => void;
}

const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item.uid, label: item.displayName });
    }
  };

  const upHandler = () => {
    setSelectedIndex(((selectedIndex + props.items.length) - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden min-w-[200px]">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors ${
              index === selectedIndex ? 'bg-slate-100' : ''
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.photoURL} alt={item.displayName} />
              <AvatarFallback className="text-[10px]">{item.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">{item.displayName}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-slate-500">Nessun utente trovato</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
