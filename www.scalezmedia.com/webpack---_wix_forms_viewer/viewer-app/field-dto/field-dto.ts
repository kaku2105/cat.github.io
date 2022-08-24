import _ from 'lodash'
import { CRM_TYPES, CUSTOM_FIELD } from '../../constants/crm-types-tags'
import {
  StandardField,
  TaggedField,
  Field,
  CustomField,
  AttachmentField,
  SubscribeField,
  AdditionalField,
  MultipleAttachmentsField,
  ExtendedField,
} from '../../types/domain-types'
import { FormsFieldPreset, AdiFieldPreset } from '@wix/forms-common'
import {
  getFieldType,
  FIELD_TYPE,
  getFieldRawValue,
  isComplexInnerField,
  toAddressV2,
} from '../viewer-utils'
import { siteStore } from '../stores/site-store'

export interface Attachment {
  url: string
  name: string
  value: any
  uniqueId: string
  width?: number
  height?: number
  mediaId?: string
  title?: string
}

const FIELD_VALUE_TYPE = {
  RATING: 'rating',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  TIME: 'time',
  SUBSCRIBE: 'subscribe',
  STRING: 'string',
  ATTACHMENT: 'attachmentV2',
  ATTACHMENTS: 'attachments',
  SIGNATURE: 'signature',
  ADDITIONAL: 'additional',
  CUSTOM: 'custom',
  EXTENDED: 'extended',
  ARRRAY: 'array',
  PHONE: 'phoneV2',
  AUTOCOMPLETE_ADDRESS: 'addressV2',
  COMPLEX_ADDRESS_STREET: 'streetAddress',
  COMPLEX_ADDRESS_STREET2: 'streetAddress2',
  COMPLEX_ADDRESS_CITY: 'city',
  COMPLEX_ADDRESS_REGION: 'region',
  COMPLEX_ADDRESS_ZIP_CODE: 'zipCode',
  COMPLEX_ADDRESS_COUNTRY: 'country',
}

const getFieldValueType = (field) => {
  const fieldType = getFieldType(field)

  switch (fieldType) {
    case FIELD_TYPE.RATING:
      return FIELD_VALUE_TYPE.RATING
    case FIELD_TYPE.CHECKBOX:
      return FIELD_VALUE_TYPE.CHECKBOX
    case FIELD_TYPE.DATE:
      return FIELD_VALUE_TYPE.DATE
    case FIELD_TYPE.TIME:
      return FIELD_VALUE_TYPE.TIME
    case FIELD_TYPE.CHECKBOX_GROUP:
      return FIELD_VALUE_TYPE.ARRRAY
    case FIELD_TYPE.COMPLEX_PHONE:
      return FIELD_VALUE_TYPE.PHONE
    case FIELD_TYPE.AUTOCOMPLETE_ADDRESS:
      return FIELD_VALUE_TYPE.AUTOCOMPLETE_ADDRESS
    default:
      return FIELD_VALUE_TYPE.STRING
  }
}

export const getFieldValue = (field) => {
  const fieldType = getFieldType(field)

  const rawValue = getFieldRawValue(field)

  switch (fieldType) {
    case FIELD_TYPE.RATING:
      if (rawValue) {
        return Number(rawValue)
      }
      break
    case FIELD_TYPE.DATE:
      if (!rawValue) {
        return
      }
      const padZero = (num) => _.padStart(num, 2, '0')
      return `${rawValue.getFullYear()}-${padZero(rawValue.getMonth() + 1)}-${padZero(
        rawValue.getDate(),
      )}`
    case FIELD_TYPE.CHECKBOX_GROUP:
      return { values: rawValue }
    case FIELD_TYPE.TIME: {
      return { value: rawValue, format: field.useAmPmFormat ? 'AMPM' : 'FULL' }
    }
    case FIELD_TYPE.RADIO_GROUP: {
      return _.get(_.find(field.options, { value: rawValue }), 'label', rawValue)
    }
    case FIELD_TYPE.AUTOCOMPLETE_ADDRESS: {
      return toAddressV2(rawValue || {})
    }
    /* let's do this in a separate ticket
    case FIELD_TYPE.TEXT_INPUT: {
      if (getCrmType(field) === CRM_TYPES.PHONE) {
        return { value: rawValue, prefix: '' }
      }
    }*/
    default:
      return rawValue
  }
}

const complexField = (field: WixCodeField) => {
  const parentId = field.parent.uniqueId
  const dto = taggedField(field)

  // @ts-expect-error
  dto.key = parentId

  return dto
}
const standardField = (field): StandardField => ({ value: getFieldValue(field) })

const taggedField = (field): TaggedField => {
  const dto = standardField(field)
  const tag = getCrmTag(field)

  if (tag) {
    // @ts-expect-error
    dto.tag = tag
  }

  return dto
}

export const attachmentField = (
  field,
  attachments: Attachment[][],
): AttachmentField | MultipleAttachmentsField => {
  const attachment = getAttachment(field, attachments)

  return attachment?.length
    ? (attachment.length > 1 || siteStore.isEnabled('specs.crm.FormsViewerMultipleFileUploadSupport'))
      ? { values: attachment.map(({ name, url }) => ({ name, url })) } 
      : {
        attachment: {
          name: attachment[0].name,
          url: attachment[0].url,
        },
      }
    : {}
}
export const signatureField = (
  field,
  attachments: Attachment[][],
): AttachmentField | MultipleAttachmentsField => {
  const attachment = getAttachment(field, attachments)

  return attachment?.length
    ? {
        attachment: {
          name: attachment[0].name,
          url: attachment[0].url,
        },
      }
    : {}
}

export const getAttachment = (field, attachments: Attachment[][]) =>
  _.find<Attachment[]>(attachments, (a) => a[0].uniqueId === field.uniqueId)

const subscribeField = ({ field, options }): SubscribeField => {
  const valueType = getFieldValueType(field)
  const extraData: any = _.get(options, 'doubleOptIn') ? { mode: 'DOUBLE_OPT' } : {}

  return {
    [valueType]: getFieldValue(field),
    ...extraData,
  }
}

const attachmentCrmFieldTypes = [
  FormsFieldPreset.GENERAL_UPLOAD_BUTTON,
  AdiFieldPreset.ADI_UPLOAD_BUTTON,
]

const generalField = ({
  field,
  attachments,
  options,
}: {
  field
  attachments: Attachment[][]
  options
}): AdditionalField | CustomField | AttachmentField | SubscribeField | MultipleAttachmentsField => {
  const crmFieldType = getFieldPreset(field)

  if (crmFieldType === FormsFieldPreset.GENERAL_SUBSCRIBE) {
    return subscribeField({ field, options })
  }

  if (_.includes(attachmentCrmFieldTypes, crmFieldType)) {
    return attachmentField(field, attachments)
  }
  
  if (crmFieldType === FormsFieldPreset.GENERAL_SIGNATURE) {
    return signatureField(field, attachments)
  }

  const valueType = getFieldValueType(field)
  const fieldValue = getFieldValue(field)

  const fieldDto: CustomField | AdditionalField | ExtendedField = {}

  if (isComplexInnerField(field)) {
    const complexWidgetId = field.parent.uniqueId

    // @ts-expect-error
    fieldDto.key = complexWidgetId
  }

  if (fieldValue !== undefined) {
    fieldDto.value = {
      [valueType]: fieldValue,
    }
  }

  const customFieldId = getCustomFieldId(field)
  const customFieldKey = getCustomFieldKey(field)

  if (customFieldKey) {
    // @ts-expect-error
    fieldDto.key = customFieldKey
  } else if (customFieldId) {
    // @ts-expect-error
    fieldDto.customFieldId = customFieldId
  }

  return fieldDto
}

const getCrmType = (field: WixCodeField) => {
  return field.connectionConfig.crmType
}

const getCustomFieldId = (field: WixCodeField) => {
  return field.connectionConfig.customFieldId
}
const getCustomFieldKey = (field: WixCodeField) => {
  return field.connectionConfig.customFieldKey
}

const getCrmLabel = (field: WixCodeField) => {
  return field.connectionConfig.crmLabel
}

const getCrmTag = (field: WixCodeField) => {
  return field.connectionConfig.crmTag
}

const getFieldPreset = (field: WixCodeField) => {
  return field.connectionConfig.fieldType
}

const fieldDtoValueHandlerByCrmType = {
  [CRM_TYPES.FIRST_NAME]: (field) => standardField(field),
  [CRM_TYPES.LAST_NAME]: (field) => standardField(field),
  [CRM_TYPES.COMPANY]: (field) => standardField(field),
  [CRM_TYPES.POSITION]: (field) => standardField(field),
  [CRM_TYPES.EMAIL]: (field) => taggedField(field),
  [CRM_TYPES.PHONE]: (field) => taggedField(field),
  [CRM_TYPES.ADDRESS]: (field) => taggedField(field),
  [CRM_TYPES.DATE]: (field) => taggedField(field),
  [CRM_TYPES.WEBSITE]: (field) => taggedField(field),
  [CRM_TYPES.COMPLEX_ADDRESS_STREET]: (field) => complexField(field),
  [CRM_TYPES.COMPLEX_ADDRESS_STREET2]: (field) => complexField(field),
  [CRM_TYPES.COMPLEX_ADDRESS_CITY]: (field) => complexField(field),
  [CRM_TYPES.COMPLEX_ADDRESS_REGION]: (field) => complexField(field),
  [CRM_TYPES.COMPLEX_ADDRESS_ZIP_CODE]: (field) => complexField(field),
  [CRM_TYPES.COMPLEX_ADDRESS_COUNTRY]: (field) => complexField(field),
}

const convertToServerFieldType = (field) => {
  const crmType = getCrmType(field)

  switch (crmType) {
    case CUSTOM_FIELD:
      const crmFieldType = getFieldPreset(field)
      switch (crmFieldType) {
        case FormsFieldPreset.GENERAL_SUBSCRIBE:
          return FIELD_VALUE_TYPE.SUBSCRIBE
        case AdiFieldPreset.ADI_UPLOAD_BUTTON:
        case FormsFieldPreset.GENERAL_UPLOAD_BUTTON:
          return field.value?.length > 1 || siteStore.isEnabled('specs.crm.FormsViewerMultipleFileUploadSupport') ?
            FIELD_VALUE_TYPE.ATTACHMENTS : 
            FIELD_VALUE_TYPE.ATTACHMENT
        case FormsFieldPreset.GENERAL_SIGNATURE:
          return FIELD_VALUE_TYPE.SIGNATURE
        default:
          const customFieldId = getCustomFieldId(field)
          const customFieldKey = getCustomFieldKey(field)
          return _.isEmpty(customFieldId) && _.isEmpty(customFieldKey)
            ? FIELD_VALUE_TYPE.ADDITIONAL
            : !_.isEmpty(customFieldKey)
            ? FIELD_VALUE_TYPE.EXTENDED
            : FIELD_VALUE_TYPE.CUSTOM
      }
    case CRM_TYPES.COMPLEX_ADDRESS_STREET: {
      return FIELD_VALUE_TYPE.COMPLEX_ADDRESS_STREET
    }
    case CRM_TYPES.COMPLEX_ADDRESS_STREET2: {
      return FIELD_VALUE_TYPE.COMPLEX_ADDRESS_STREET2
    }
    case CRM_TYPES.COMPLEX_ADDRESS_CITY: {
      return FIELD_VALUE_TYPE.COMPLEX_ADDRESS_CITY
    }
    case CRM_TYPES.COMPLEX_ADDRESS_COUNTRY: {
      return FIELD_VALUE_TYPE.COMPLEX_ADDRESS_COUNTRY
    }
    case CRM_TYPES.COMPLEX_ADDRESS_REGION: {
      return FIELD_VALUE_TYPE.COMPLEX_ADDRESS_REGION
    }
    case CRM_TYPES.COMPLEX_ADDRESS_ZIP_CODE: {
      return FIELD_VALUE_TYPE.COMPLEX_ADDRESS_ZIP_CODE
    }
    case CRM_TYPES.PHONE:
      // we can delete this after, and always send phoneV2
      if (getFieldType(field) === FIELD_TYPE.COMPLEX_PHONE) {
        return 'phoneV2'
      } else {
        return crmType
      }
    case CRM_TYPES.ADDRESS:
      // we can delete this after, and always send addressV2
      if (getFieldType(field) === FIELD_TYPE.AUTOCOMPLETE_ADDRESS) {
        return 'addressV2'
      } else {
        return crmType
      }
    default:
      return crmType
  }
}

export const createFieldDto = ({
  field,
  attachments = [],
  options = {},
}: {
  field
  attachments?: Attachment[][]
  options?
}): Field => {
  const crmType = getCrmType(field)

  const fieldValueHandler = fieldDtoValueHandlerByCrmType[crmType]
  const fieldValue = fieldValueHandler
    ? fieldValueHandler(field)
    : generalField({ field, attachments, options })

  const serverCrmType = convertToServerFieldType(field)

  const fieldId = _.includes(field.uniqueId, '_r_')
    ? _.split(field.uniqueId, '_r_')[1]
    : field.uniqueId

  return {
    fieldId,
    label: getCrmLabel(field),
    [serverCrmType]: fieldValue,
  }
}

export const getPhoneStringValueByType = (fieldValue, fieldType) => {
  switch (fieldType) {
    case FormsFieldPreset.COMPLEX_PHONE_WIDGET:
      return fieldValue.prefix ? `(${fieldValue.prefix}) ${fieldValue.value}` : fieldValue.value
    default:
      return fieldValue
  }
}
