import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import ColorSlider from './ColorSlider';

const SettingsSection = ({ section }) => {
  const { settings, updateSetting } = useSettings();

  const renderSection = () => {
    switch (section) {
      case 'general':
        return <GeneralSection settings={settings} updateSetting={updateSetting} />;
      case 'privacy':
        return <PrivacySection settings={settings} updateSetting={updateSetting} />;
      case 'notifications':
        return <NotificationsSection settings={settings} updateSetting={updateSetting} />;
      case 'chat':
        return <ChatSection settings={settings} updateSetting={updateSetting} />;
      case 'appearance':
        return <AppearanceSection settings={settings} updateSetting={updateSetting} />;
      case 'personalization':
        return <PersonalizationSection settings={settings} updateSetting={updateSetting} />;
      case 'data':
        return <DataSection settings={settings} updateSetting={updateSetting} />;
      default:
        return <GeneralSection settings={settings} updateSetting={updateSetting} />;
    }
  };

  return (
    <section className={`settingsSection ${section ? 'active' : ''}`} id={`section-${section}`}>
      {renderSection()}
    </section>
  );
};

const GeneralSection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>General Settings</h2>
      <label htmlFor="username">Username:</label>
      <input 
        type="text" 
        id="usernameInput" 
        placeholder="Enter username"
        value={settings.username || ''}
        onChange={(e) => updateSetting('username', e.target.value)}
      />

      <label htmlFor="statusMessage">Status Message:</label>
      <input 
        type="text" 
        id="statusMessage" 
        placeholder="What's on your mind?"
        value={settings.statusMessage || ''}
        onChange={(e) => updateSetting('statusMessage', e.target.value)}
      />

      <button className="saveButton" onClick={() => console.log('Settings saved')}>
        Save Changes
      </button>
    </>
  );
};

const PrivacySection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>Privacy Settings</h2>
      <div className="settingsGrid">
        <div className="settingsColumn">
          <CheckboxSetting
            id="showOnline"
            label="Show online status"
            checked={settings.showOnline}
            onChange={(checked) => updateSetting('showOnline', checked)}
          />
          <CheckboxSetting
            id="readReceipts"
            label="Send read receipts"
            checked={settings.readReceipts}
            onChange={(checked) => updateSetting('readReceipts', checked)}
          />
        </div>
        <div className="settingsColumn">
          <CheckboxSetting
            id="typingIndicator"
            label="Show typing indicator"
            checked={settings.typingIndicator}
            onChange={(checked) => updateSetting('typingIndicator', checked)}
          />
          <CheckboxSetting
            id="lastSeen"
            label="Share last seen"
            checked={settings.lastSeen}
            onChange={(checked) => updateSetting('lastSeen', checked)}
          />
        </div>
      </div>
    </>
  );
};

const NotificationsSection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>Notification Settings</h2>
      <div className="settingsGrid">
        <div className="settingsColumn">
          <CheckboxSetting
            id="notifications"
            label="Enable notifications"
            checked={settings.notifications}
            onChange={(checked) => updateSetting('notifications', checked)}
          />
          <CheckboxSetting
            id="soundNotifications"
            label="Sound notifications"
            checked={settings.soundNotifications}
            onChange={(checked) => updateSetting('soundNotifications', checked)}
          />
        </div>
        <div className="settingsColumn">
          <CheckboxSetting
            id="desktopNotifications"
            label="Desktop notifications"
            checked={settings.desktopNotifications}
            onChange={(checked) => updateSetting('desktopNotifications', checked)}
          />
          <CheckboxSetting
            id="mentionNotifications"
            label="Notify on mentions only"
            checked={settings.mentionNotifications}
            onChange={(checked) => updateSetting('mentionNotifications', checked)}
          />
        </div>
      </div>
    </>
  );
};

const ChatSection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>Chat Settings</h2>
      <div className="settingsGrid">
        <div className="settingsColumn">
          <SelectSetting
            id="fontSize"
            label="Font Size:"
            value={settings.fontSize}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' }
            ]}
            onChange={(value) => updateSetting('fontSize', value)}
          />

          <SelectSetting
            id="messageDisplay"
            label="Message Display:"
            value={settings.messageDisplay}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'cozy', label: 'Cozy' },
              { value: 'spacious', label: 'Spacious' }
            ]}
            onChange={(value) => updateSetting('messageDisplay', value)}
          />
        </div>

        <div className="settingsColumn">
          <CheckboxSetting
            id="enterToSend"
            label="Press Enter to send"
            checked={settings.enterToSend}
            onChange={(checked) => updateSetting('enterToSend', checked)}
          />
          <CheckboxSetting
            id="showTimestamps"
            label="Show message timestamps"
            checked={settings.showTimestamps}
            onChange={(checked) => updateSetting('showTimestamps', checked)}
          />
          <CheckboxSetting
            id="groupMessages"
            label="Group consecutive messages"
            checked={settings.groupMessages}
            onChange={(checked) => updateSetting('groupMessages', checked)}
          />
        </div>
      </div>
    </>
  );
};

const AppearanceSection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>Appearance Settings</h2>
      <label>Theme:</label>
      <RadioSetting
        name="theme"
        value="light"
        label="Light"
        checked={settings.theme === 'light'}
        onChange={() => updateSetting('theme', 'light')}
      />
      <RadioSetting
        name="theme"
        value="dark"
        label="Dark"
        checked={settings.theme === 'dark'}
        onChange={() => updateSetting('theme', 'dark')}
      />
      <RadioSetting
        name="theme"
        value="oled"
        label="OLED"
        checked={settings.theme === 'oled'}
        onChange={() => updateSetting('theme', 'oled')}
      />
    </>
  );
};

const PersonalizationSection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>Personalization</h2>
      <ColorSlider
        label="Primary Color"
        colorType="primary"
        value={settings.primaryColor}
        onChange={(color) => updateSetting('primaryColor', color)}
      />
      <ColorSlider
        label="Secondary Color"
        colorType="secondary"
        value={settings.secondaryColor}
        onChange={(color) => updateSetting('secondaryColor', color)}
      />
      <ColorSlider
        label="User Message Color"
        colorType="user"
        value={settings.userColor}
        onChange={(color) => updateSetting('userColor', color)}
      />
      <ColorSlider
        label="Others Message Color"
        colorType="others"
        value={settings.othersColor}
        onChange={(color) => updateSetting('othersColor', color)}
      />
    </>
  );
};

const DataSection = ({ settings, updateSetting }) => {
  return (
    <>
      <h2>Data & Storage</h2>
      <CheckboxSetting
        id="autoDownload"
        label="Auto-download media"
        checked={settings.autoDownload}
        onChange={(checked) => updateSetting('autoDownload', checked)}
      />
      <CheckboxSetting
        id="saveHistory"
        label="Save chat history"
        checked={settings.saveHistory}
        onChange={(checked) => updateSetting('saveHistory', checked)}
      />
      <button className="saveButton" onClick={() => console.log('Download chat data')}>
        Download Chat Data (JSON)
      </button>
    </>
  );
};

const CheckboxSetting = ({ id, label, checked, onChange }) => {
  return (
    <div className="checkboxWrapper">
      <input 
        type="checkbox" 
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

const RadioSetting = ({ name, value, label, checked, onChange }) => {
  return (
    <div className="radioWrapper">
      <input 
        type="radio" 
        id={`${name}-${value}`}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`${name}-${value}`}>{label}</label>
    </div>
  );
};

const SelectSetting = ({ id, label, value, options, onChange }) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select 
        id={id} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default SettingsSection;