import React from 'react';
import { BodyMapNew } from './body-map-new';
import { FadeInView } from './motion-utils';

export function SymptomsView() {
  return (
    <FadeInView className="space-y-6">
      <BodyMapNew />
    </FadeInView>
  );
}
