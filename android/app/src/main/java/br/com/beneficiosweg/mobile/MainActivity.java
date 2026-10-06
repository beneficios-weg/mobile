package br.com.beneficiosweg.mobile;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import br.com.beneficiosweg.mobile.location.BenefitsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BenefitsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
