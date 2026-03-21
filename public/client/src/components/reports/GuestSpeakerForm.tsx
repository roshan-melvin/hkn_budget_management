import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

interface Speaker {
    name: string;
    role: string;
    affiliation?: string;
    contact?: string;
    topic?: string;
}

interface GuestSpeakerFormProps {
    speakers: Speaker[];
    onChange: (speakers: Speaker[]) => void;
    title?: string;
}

const GuestSpeakerForm: React.FC<GuestSpeakerFormProps> = ({
    speakers,
    onChange,
    title = 'Guest Speakers'
}) => {
    const addSpeaker = () => {
        onChange([...speakers, { name: '', role: '', affiliation: '', contact: '', topic: '' }]);
    };

    const removeSpeaker = (index: number) => {
        onChange(speakers.filter((_, i) => i !== index));
    };

    const updateSpeaker = (index: number, field: keyof Speaker, value: string) => {
        const updated = speakers.map((speaker, i) =>
            i === index ? { ...speaker, [field]: value } : speaker
        );
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-primary">
                    {title}
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add {title.slice(0, -1)}
                </Button>
            </div>

            {speakers.length === 0 ? (
                <div className="text-center py-8 bg-bg-secondary rounded-lg border border-border">
                    <p className="text-text-muted text-sm">
                        No {title.toLowerCase()} added yet
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSpeaker}
                        className="mt-3"
                    >
                        Add First {title.slice(0, -1)}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {speakers.map((speaker, index) => (
                        <div
                            key={index}
                            className="p-4 bg-bg-secondary rounded-lg border border-border space-y-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-text-primary">
                                    {title.slice(0, -1)} #{index + 1}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => removeSpeaker(index)}
                                    className="p-1 text-text-secondary hover:text-red-600 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    label="Name *"
                                    value={speaker.name}
                                    onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                                    placeholder="Full name"
                                    required
                                />
                                <Input
                                    label="Role *"
                                    value={speaker.role}
                                    onChange={(e) => updateSpeaker(index, 'role', e.target.value)}
                                    placeholder="e.g., Keynote Speaker, Panelist"
                                    required
                                />
                                <Input
                                    label="Affiliation"
                                    value={speaker.affiliation || ''}
                                    onChange={(e) => updateSpeaker(index, 'affiliation', e.target.value)}
                                    placeholder="Organization/University"
                                />
                                <Input
                                    label="Contact"
                                    value={speaker.contact || ''}
                                    onChange={(e) => updateSpeaker(index, 'contact', e.target.value)}
                                    placeholder="Email or phone"
                                />
                            </div>

                            <Input
                                label="Topic"
                                value={speaker.topic || ''}
                                onChange={(e) => updateSpeaker(index, 'topic', e.target.value)}
                                placeholder="Presentation/discussion topic"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuestSpeakerForm;
