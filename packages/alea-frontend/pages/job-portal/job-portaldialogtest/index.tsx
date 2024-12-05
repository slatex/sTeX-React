import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
} from '@mui/material';
import {
  getOrganizationId,
  OrganizationData,
  RecruiterAndOrgData,
  RecruiterData,
  updateOrganizationProfile,
  upDateRecruiterProfile,
} from '@stex-react/api';

const RecruiterProfileDialog = ({
  isOpen,
  setIsOpen,
  recruiterAndOrgData,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  recruiterAndOrgData: RecruiterAndOrgData;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    mobile: '',
    altMobile: '',
  });

  const steps = ['Recruiter Details', 'Organization Information'];

  const {
    name,
    email,
    companyName,
    position,
    mobile,
    altMobile,
    incorporationYear,
    isStartup,
    about,
    companyType,
    officeAddress,
    officePincode,
    website,
  } = recruiterAndOrgData;
  interface RecruiterOrganizationFormState {
    recruiterDetails: RecruiterData;
    organizationInfo: OrganizationData;
  }
  const [formData, setFormData] = useState<RecruiterOrganizationFormState>({
    recruiterDetails: {
      email: email,
      name: name,
      position: position,
      mobile: mobile,
      altMobile: altMobile,
    },
    organizationInfo: {
      companyName: companyName,
      incorporationYear: incorporationYear,
      isStartup: isStartup,
      website: website,
      about: about,
      companyType: companyType,
      officeAddress: officeAddress,
      officePincode: officePincode,
    },
  });

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value,
      },
    });
  };

  const validateFields = () => {
    const errors = {
      email: '',
      mobile: '',
      altMobile: '',
    };
    if (!formData.recruiterDetails.email || !/\S+@\S+\.\S+/.test(formData.recruiterDetails.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.recruiterDetails.mobile || !/^\d{10}$/.test(formData.recruiterDetails.mobile)) {
      errors.mobile = 'Enter a valid 10-digit mobile number.';
    }
    if (
      formData.recruiterDetails.altMobile &&
      !/^\d{10}$/.test(formData.recruiterDetails.altMobile)
    ) {
      errors.altMobile = 'Enter a valid 10-digit mobile number or leave it empty.';
    }

    setValidationErrors(errors);
    return !errors.email && !errors.mobile && !errors.altMobile;
  };

  const handleNext = async () => {
    if (!validateFields()) {
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      const id = await getOrganizationId(formData.organizationInfo.companyName);
      await updateOrganizationProfile(formData.organizationInfo, id);
      await upDateRecruiterProfile({
        ...formData.recruiterDetails,
        organizationId: id,
      });
      setIsOpen(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveStep(0);
  };

  return (
    <div className="recruiter-dashboard">
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{steps[activeStep]}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <div style={{ marginTop: '20px' }}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.email}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
              <TextField
                label="Name"
                name="name"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.name}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
              />
              <TextField
                label="Designation"
                name="position"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.position}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
              />
              <TextField
                label="Mobile"
                name="mobile"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.mobile}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
                error={!!validationErrors.mobile}
                helperText={validationErrors.mobile}
              />
              <TextField
                label="Alternative Mobile"
                name="altMobile"
                fullWidth
                margin="normal"
                value={formData.recruiterDetails.altMobile}
                onChange={(e) => handleChange(e, 'recruiterDetails')}
                error={!!validationErrors.altMobile}
                helperText={validationErrors.altMobile}
              />
            </div>
          )}

          {activeStep === 1 && (
            <div style={{ marginTop: '20px' }}>
              <TextField
                label="Company Name"
                name="companyName"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.companyName}
                onChange={(e) => handleChange(e, 'organizationInfo')}
                disabled
              />
              <TextField
                label="Incorporation Year"
                name="incorporationYear"
                type="number"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.incorporationYear}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Startup"
                name="isStartup"
                select
                fullWidth
                margin="normal"
                value={formData.organizationInfo.isStartup}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                label="Website"
                name="website"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.website}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="About"
                name="about"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={formData.organizationInfo.about}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Type"
                name="companyType"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.companyType}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Office Address"
                name="officeAddress"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.officeAddress}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
              <TextField
                label="Office Pincode"
                name="officePincode"
                fullWidth
                margin="normal"
                value={formData.organizationInfo.officePincode}
                onChange={(e) => handleChange(e, 'organizationInfo')}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && (
            <Button onClick={handleBack} color="secondary">
              Back
            </Button>
          )}
          <Button onClick={handleNext} color="primary">
            {activeStep === steps.length - 1 ? 'Submit' : 'Save and Next'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RecruiterProfileDialog;
