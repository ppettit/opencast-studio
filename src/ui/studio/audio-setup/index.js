//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Container, Flex, Heading, Text } from '@theme-ui/components';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

import { useDispatch, useRecordingState } from '../../../recording-context';

import { startAudioCapture, stopAudioCapture } from '../capturer';
import { ActionButtons } from '../elements';
import Notification from '../../notification';

import PreviewAudio from './preview-audio';

export default function AudioSetup(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const state = useRecordingState();
  const audioStream = state.audioStream;
  const audioAllowed = state.audioAllowed;

  const MICROPHONE = 'microphone';
  const NO_AUDIO = 'no-audio';
  const NONE = 'none';

  const [active, updateActive] = useState(audioStream ? MICROPHONE : NONE);

  const backToSetupVideo = useCallback(() => {
    stopAudioCapture(audioStream, dispatch);
    props.previousStep();
  }, [dispatch, props, audioStream]);

  const enterStudio = useCallback(() => {
    // TODO: combine audio, user, display ?
    props.nextStep();
  }, [props]);

  const selectMicrophone = () => {
    updateActive(MICROPHONE);
    startAudioCapture(dispatch).then(success => {
      if (!success) {
        updateActive(NONE);
      }
    });
  };

  const selectNoAudio = () => {
    updateActive(NO_AUDIO);
    if (audioStream) {
      stopAudioCapture(audioStream, dispatch);
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto',
      }}
    >
      <Styled.h1 sx={{ textAlign: 'center' }}>{t('sources-audio-question')}</Styled.h1>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          maxWidth: 850,
          width: '100%',
          mx: 'auto',
          mb: 3,
          flex: '1 0 auto',
          maxHeight: ['none', '350px'],
          '& > :first-child': {
            mb: [3, 0],
            mr: [0, 3],
          },
        }}
      >
        <OptionButton
          icon={faMicrophone}
          label={t('sources-audio-microphone')}
          selected={active === MICROPHONE}
          onClick={selectMicrophone}
        >
          { audioStream && <PreviewAudio stream={audioStream} /> }
          { audioAllowed === false && (
            <Notification isDanger sx={{ mt: 2 }}>
              <Heading as="h3" mb={2}>
                {t('source-audio-not-allowed-title')}
              </Heading>
              <Text variant='text'>{t('source-audio-not-allowed-text')}</Text>
            </Notification>
          )}
        </OptionButton>
        <OptionButton
          icon={faMicrophoneSlash}
          label={t('sources-audio-without-audio')}
          selected={active === NO_AUDIO}
          onClick={selectNoAudio}
        >
        </OptionButton>
      </Flex>

      <ActionButtons
        prev={{ onClick: backToSetupVideo }}
        next={{ onClick: enterStudio, disabled: active === NONE }}
      />
    </Container>
  );
}

const OptionButton = ({ children, icon, label, selected, onClick }) => {
  const selectedStyle = !selected ? {} : {
    backgroundColor: 'highlight',
  };

  return (
    <button
      onClick={() => selected || onClick() }
      sx={{
        fontFamily: 'inherit',
        color: 'gray.0',
        border: '2px solid black',
        borderRadius: '8px',
        flex: '0 1 50%',
        // height: ['240px', '300px'],
        p: 2,
        ...selectedStyle
      }}
    >
      <div sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
        <FontAwesomeIcon icon={icon} size="3x"/>
      </div>
      <div sx={{ fontSize: 4 }}>{label}</div>
      {children}
    </button>
  );
};
