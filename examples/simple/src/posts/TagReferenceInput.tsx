import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useCallback, useState } from 'react';
import { useForm } from 'react-final-form';
import {
    AutocompleteArrayInput,
    ReferenceArrayInput,
    useCreate,
    useCreateSuggestionContext,
    useLocale,
} from 'react-admin';
import {
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    TextField as MuiTextField,
} from '@mui/material';

const PREFIX = 'TagReferenceInput';

const classes = {
    button: `${PREFIX}-button`,
    input: `${PREFIX}-input`,
};

const StyledDialog = styled(Dialog)({
    [`& .${classes.button}`]: {
        margin: '0 24px',
        position: 'relative',
    },
    [`& .${classes.input}`]: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '50%',
    },
});

const useTagsFilterToQuery = () => {
    const locale = useLocale();
    return useCallback(
        (filter: string) =>
            filter
                ? {
                      [`name.${locale}_q`]: filter,
                  }
                : {},
        [locale]
    );
};

const TagReferenceInput = ({
    ...props
}: {
    reference: string;
    source: string;
    label?: string;
}) => {
    const { change } = useForm();
    const [filter, setFilter] = useState({ published: true });
    const filterToQuery = useTagsFilterToQuery();
    const locale = useLocale();

    const handleAddFilter = () => {
        setFilter(prev => ({ published: !prev.published }));
        change('tags', []);
    };

    return (
        <div className={classes.input}>
            <ReferenceArrayInput
                {...props}
                filter={filter}
                filterToQuery={filterToQuery}
            >
                <AutocompleteArrayInput
                    create={<CreateTag />}
                    optionText={`name.${locale}`}
                />
            </ReferenceArrayInput>
            <Button
                name="change-filter"
                className={classes.button}
                onClick={handleAddFilter}
            >
                Filter {filter ? 'Unpublished' : 'Published'} Tags
            </Button>
        </div>
    );
};

const CreateTag = () => {
    const { filter, onCancel, onCreate } = useCreateSuggestionContext();
    const [value, setValue] = React.useState(filter || '');
    const [create] = useCreate('tags');
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        create(
            {
                payload: {
                    data: {
                        name: {
                            en: value,
                        },
                    },
                },
            },
            {
                onSuccess: ({ data }) => {
                    setValue('');
                    const choice = data;
                    onCreate(choice);
                },
            }
        );
        return false;
    };
    return (
        <StyledDialog open onClose={onCancel}>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <MuiTextField
                        label="New tag"
                        value={value}
                        onChange={event => setValue(event.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit">Save</Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </DialogActions>
            </form>
        </StyledDialog>
    );
};

export default TagReferenceInput;
